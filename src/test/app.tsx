import { vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import router from "@/routes/router";
// @ts-expect-error тестові дані без типів (ті самі, що й для наскрізних тестів)
import { route, me } from "../../e2e/mockData.mjs";
import { createQueryClient, mockServer, type Call } from "./http";

export type Role = "GUEST" | "USER" | "MODERATOR" | "ADMIN";
export { me };

vi.mock("@stomp/stompjs", () => ({
  Client: class {
    connected = false;
    activate() {}
    deactivate() {}
    subscribe() {}
    publish() {}
  },
}));

/** Повний застосунок на тестових даних; overrides мають пріоритет ("METHOD /шлях" або "/шлях") */
export function renderApp(path: string, role: Role = "USER", overrides: Record<string, unknown> = {}) {
  localStorage.clear();
  if (role !== "GUEST") localStorage.setItem("authToken", "t");
  const srv = mockServer(new Proxy({} as Record<string, unknown>, {
    has: () => true,
    get: (_t, key: string) => {
      const [method, url] = key.includes(" ") ? key.split(" ") : ["GET", key];
      if (`${method} ${url}` in overrides) return overrides[`${method} ${url}`];
      if (method === "GET" && url in overrides) return overrides[url];
      if (url === "/api/users/me") return { ...me, role };
      const ex = url.match(/^\/api\/exchanges\/([^/]+)\/.+/);
      if (method !== "GET" && ex) {
        // дії з обміном повертають оновлений обмін
        const current = overrides[`/api/exchanges/${ex[1]}`] ?? route("GET", `/api/exchanges/${ex[1]}`, new URLSearchParams());
        return current ?? {};
      }
      return (call: Call) => {
        const q = new URLSearchParams(Object.entries(call.params ?? {}).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]));
        const out = route(method, url, q);
        return out === undefined ? {} : out;
      };
    },
  }));
  const qc = createQueryClient();
  const memory = createMemoryRouter(router.routes, { initialEntries: [path] });
  const view = render(
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={memory} />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  );
  return { srv, qc, memory, view };
}
