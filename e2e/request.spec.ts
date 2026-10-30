import { test, expect } from "./fixtures";

test("читач подає заявку на книжку", async ({ page, calls }) => {
  await page.goto("/listings/l2");
  await page.getByRole("button", { name: "Подати заявку" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Поштою" }).click().catch(() => {});
  await dialog.getByRole("textbox").last().fill("Хочу прочитати, поверну вчасно.");
  await dialog.getByRole("button", { name: "Надіслати заявку" }).click();

  await expect.poll(() => calls.find((c) => c.method === "POST" && c.path === "/api/listings/l2/requests")).toBeTruthy();
  const sent = calls.find((c) => c.method === "POST" && c.path === "/api/listings/l2/requests")!;
  expect(sent.body).toMatchObject({ message: "Хочу прочитати, поверну вчасно." });
  expect((sent.body as { readingDays: number }).readingDays).toBeGreaterThan(0);
});

test("сторінка обміну показує строк повернення", async ({ page }) => {
  await page.goto("/exchanges/e3");
  await expect(page.getByText("Солодка Даруся").first()).toBeVisible();
  await expect(page.getByText(/2 дні/).first()).toBeVisible();
});
