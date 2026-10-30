import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import FeedbackDialogProvider from "@/context/FeedbackDialogProvider";
import { useFeedbackDialog } from "@/context/FeedbackDialogContext";
import { useChatSocket } from "@/context/ChatSocketContext";
import GuestOnlyRoute from "@/components/routes/GuestOnlyRoute";
import ProtectedRoute from "@/components/routes/ProtectedRoute";
import RegularUserRoute from "@/components/routes/RegularUserRoute";
import ModeratorRoute from "@/components/routes/ModeratorRoute";
import { createQueryClient, mockServer, wrapper } from "./http";

let qc: QueryClient;
beforeEach(() => {
  localStorage.clear();
  qc = createQueryClient();
});

describe("контекст автентифікації", () => {
  it("вхід, реєстрація, вихід і токен з OAuth", async () => {
    const srv = mockServer({ "/api/auth/login": { token: "t-login" }, "/api/auth/register": { token: "t-reg" } });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(qc) });
    expect(result.current.isAuthenticated).toBe(false);

    await act(() => result.current.login("a@b.c", "secret1"));
    expect(result.current.token).toBe("t-login");
    expect(localStorage.getItem("authToken")).toBe("t-login");
    expect(srv.find("POST", "/api/auth/login")!.data).toEqual({ email: "a@b.c", password: "secret1" });

    act(() => result.current.logout());
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("authToken")).toBeNull();

    await act(() => result.current.register("a@b.c", "secret1", "Дмитро"));
    expect(result.current.token).toBe("t-reg");

    act(() => result.current.setTokenDirectly("t-google"));
    expect(localStorage.getItem("authToken")).toBe("t-google");
  });

  it("зчитує збережений токен під час запуску", () => {
    localStorage.setItem("authToken", "saved");
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(qc) });
    expect(result.current).toMatchObject({ token: "saved", isAuthenticated: true });
  });

  it("хуки контекстів поза провайдером повідомляють про помилку", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
    expect(() => renderHook(() => useFeedbackDialog())).toThrow(/FeedbackDialogProvider/);
    expect(() => renderHook(() => useChatSocket())).toThrow(/ChatSocketProvider/);
  });

  it("тема завжди світла", () => {
    document.documentElement.classList.add("dark");
    const { result } = renderHook(() => useTheme(), { wrapper: ({ children }: { children: ReactNode }) => <ThemeProvider>{children}</ThemeProvider> });
    expect(result.current.theme).toBe("light");
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});

describe("діалог звернення", () => {
  function Opener() {
    const { openFeedback } = useFeedbackDialog();
    return <button onClick={() => openFeedback("BUG")}>Повідомити про помилку</button>;
  }

  it("відкривається з потрібною темою", async () => {
    mockServer();
    render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <FeedbackDialogProvider><Opener /></FeedbackDialogProvider>
        </AuthProvider>
      </QueryClientProvider>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Повідомити про помилку" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});

describe("обмеження маршрутів", () => {
  const renderAt = (path: string, guard: ReactNode, me?: object) => {
    mockServer({ "/api/users/me": me ?? { id: "u1", role: "USER" } });
    return render(
      <QueryClientProvider client={qc}>
        <AuthProvider>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route element={guard}>
                <Route path="/private" element={<p>Приватна сторінка</p>} />
              </Route>
              <Route path="/" element={<p>Каталог</p>} />
              <Route path="/login" element={<p>Сторінка входу</p>} />
              <Route path="/moderation" element={<p>Панель модерації</p>} />
            </Routes>
          </MemoryRouter>
        </AuthProvider>
      </QueryClientProvider>,
    );
  };

  it("ProtectedRoute пускає лише авторизованих", () => {
    renderAt("/private", <ProtectedRoute />);
    expect(screen.getByText("Сторінка входу")).toBeInTheDocument();
  });

  it("ProtectedRoute показує сторінку після входу", () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <ProtectedRoute />);
    expect(screen.getByText("Приватна сторінка")).toBeInTheDocument();
  });

  it("GuestOnlyRoute перенаправляє авторизованого в каталог", () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <GuestOnlyRoute />);
    expect(screen.getByText("Каталог")).toBeInTheDocument();
  });

  it("GuestOnlyRoute відкриває сторінку гостю", () => {
    renderAt("/private", <GuestOnlyRoute />);
    expect(screen.getByText("Приватна сторінка")).toBeInTheDocument();
  });

  it("RegularUserRoute відправляє модератора в панель модерації", async () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <RegularUserRoute />, { id: "m", role: "MODERATOR" });
    expect(await screen.findByText("Панель модерації")).toBeInTheDocument();
  });

  it("RegularUserRoute пускає звичайного користувача", async () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <RegularUserRoute />);
    expect(await screen.findByText("Приватна сторінка")).toBeInTheDocument();
  });

  it("ModeratorRoute пускає модератора", async () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <ModeratorRoute />, { id: "m", role: "ADMIN" });
    expect(await screen.findByText("Приватна сторінка")).toBeInTheDocument();
  });

  it("ModeratorRoute показує відмову звичайному користувачу", async () => {
    localStorage.setItem("authToken", "t");
    renderAt("/private", <ModeratorRoute />);
    expect(await screen.findByText("Розділ лише для модераторів")).toBeInTheDocument();
    expect(screen.queryByText("Приватна сторінка")).toBeNull();
  });

  it("ModeratorRoute показує заглушку, поки профіль завантажується", async () => {
    localStorage.setItem("authToken", "t");
    const { container } = renderAt("/private", <ModeratorRoute />);
    expect(container.querySelector("[data-slot='skeleton'], .animate-pulse")).not.toBeNull();
    await waitFor(() => expect(screen.getByText("Розділ лише для модераторів")).toBeInTheDocument());
  });
});
