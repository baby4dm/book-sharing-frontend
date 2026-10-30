import { test as base, expect, type Page } from "@playwright/test";
// @ts-expect-error модуль тестових даних без типів
import { route, me } from "./mockData.mjs";

type Role = "GUEST" | "USER" | "MODERATOR";
export interface ApiCall { method: string; path: string; query: URLSearchParams; body: unknown }

async function mockApi(page: Page, role: Role, calls: ApiCall[]) {
  if (role !== "GUEST") {
    await page.addInitScript(() => localStorage.setItem("authToken", "e2e.test.token"));
  }
  await page.route("http://localhost:8080/**", async (r) => {
    const req = r.request();
    const url = new URL(req.url());
    let body: unknown = null;
    try { body = req.postDataJSON(); } catch { body = req.postData(); }
    calls.push({ method: req.method(), path: url.pathname, query: url.searchParams, body });
    if (url.pathname === "/api/users/me") {
      if (role === "GUEST") return r.fulfill({ status: 401, json: { message: "Unauthorized" } });
      return r.fulfill({ json: { ...me, role } });
    }
    const out = route(req.method(), url.pathname, url.searchParams);
    if (out === undefined) return r.fulfill({ status: 404, json: { message: "Not found" } });
    if (out && out.svg) return r.fulfill({ contentType: "image/svg+xml", body: out.svg });
    return r.fulfill({ json: out });
  });
}

export const test = base.extend<{ role: Role; calls: ApiCall[] }>({
  role: ["USER", { option: true }],
  calls: async ({}, use) => use([]),
  page: async ({ page, role, calls }, use) => {
    await mockApi(page, role, calls);
    await use(page);
  },
});
export { expect };
