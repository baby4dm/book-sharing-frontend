import { test, expect } from "./fixtures";

test.describe("каталог", () => {
  test.use({ role: "GUEST" });

  test("гість бачить оголошення без входу", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Ворошиловград").first()).toBeVisible();
    await expect(page.getByText("Лісова пісня").first()).toBeVisible();
  });

  test("пошук передає запит на сервер", async ({ page, calls }) => {
    await page.goto("/");
    const input = page.getByRole("textbox").first();
    await input.fill("Жадан");
    await expect.poll(() => calls.some((c) => c.path === "/api/listings" && c.query.get("search") === "Жадан")).toBe(true);
  });

  test("гість не потрапляє на сторінку обмінів", async ({ page }) => {
    await page.goto("/exchanges");
    await expect(page).toHaveURL(/\/login$/);
  });
});
