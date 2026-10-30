import { test, expect } from "./fixtures";

test.describe("звичайний користувач", () => {
  test("має розділи обмінів і не має модерації", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav.getByRole("link", { name: "Обміни" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Модерація" })).toHaveCount(0);
  });

  test("не відкриває панель модерації", async ({ page }) => {
    await page.goto("/moderation");
    await expect(page.getByText("Розділ лише для модераторів")).toBeVisible();
    await expect(page.getByText("Захар Беркут")).toHaveCount(0);
  });
});

test.describe("модератор", () => {
  test.use({ role: "MODERATOR" });

  test("переходить із заявок до панелі модерації", async ({ page }) => {
    await page.goto("/requests");
    await expect(page).toHaveURL(/\/moderation/);
  });

  test("бачить відкриті скарги", async ({ page }) => {
    await page.goto("/moderation");
    await expect(page.getByText("Захар Беркут").first()).toBeVisible();
  });
});

test.describe("мобільний екран", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("навігація переходить у нижню панель", async ({ page }) => {
    await page.goto("/");
    const tabbar = page.locator("nav").last();
    await expect(tabbar.getByText("Каталог")).toBeVisible();
    const box = await tabbar.boundingBox();
    expect(box!.y).toBeGreaterThan(700);
  });
});
