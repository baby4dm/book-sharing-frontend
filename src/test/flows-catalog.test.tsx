import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";

const user = () => userEvent.setup({ delay: null });

describe("каталог і заявки", () => {
  it("фільтри каталогу: сортування, жанр, населений пункт, спосіб доставки, скидання", async () => {
    const u = user();
    const { srv } = renderApp("/", "USER");
    await screen.findAllByText("Ворошиловград");
    await u.click(screen.getByRole("button", { name: /Сортування/ }));
    await waitFor(() => expect(srv.calls.some((c) => c.url === "/api/listings" && c.params.sort === "createdAt,asc")).toBe(true));

    await u.click(screen.getByRole("button", { name: "Фільтри" }));
    await u.click(await screen.findByText("Вибрати жанр"));
    await u.click(await screen.findByText("Проза"));
    await u.type(screen.getAllByPlaceholderText("Пошук...")[0], "фант");
    await u.clear(screen.getAllByPlaceholderText("Пошук...")[0]);
    await u.click(screen.getByText("Вибрати населений пункт"));
    await u.click(await screen.findByText("Львів"));
    await u.click(screen.getAllByRole("button", { name: /Особисто/ })[0]);
    await u.click(screen.getByRole("button", { name: "Застосувати" }));
    await waitFor(() => expect(srv.calls.some((c) => c.url === "/api/listings" && String(c.params.genre).includes("Проза"))).toBe(true));

    await u.click(screen.getByRole("button", { name: "Фільтри" }));
    await u.click(await screen.findByRole("button", { name: "Скинути" }));
    await u.type(screen.getByPlaceholderText("Назва книги або автор"), "Жадан");
    await waitFor(() => expect(srv.calls.some((c) => c.params.search === "Жадан")).toBe(true), { timeout: 3000 });
  });

  it("подання заявки з власним строком і доставкою поштою", async () => {
    const u = user();
    const { srv } = renderApp("/listings/l2", "USER");
    await u.click(await screen.findByRole("button", { name: "Подати заявку" }));
    const dialog = await screen.findByRole("dialog");
    await u.click(within(dialog).getByRole("button", { name: "Інше" }));
    const days = within(dialog).getByRole("spinbutton");
    await u.clear(days);
    await u.type(days, "200");
    await u.click(within(dialog).getByRole("button", { name: /Надіслати заявку/ }));
    await u.clear(days);
    await u.type(days, "10");
    await u.click(within(dialog).getByRole("button", { name: /Поштою/ }));
    await u.type(within(dialog).getByPlaceholderText(/Напишіть кілька слів/), "Поверну вчасно");
    await u.click(within(dialog).getByRole("button", { name: /Надіслати заявку/ }));
    await screen.findByText("Заявку надіслано!");
    const sent = srv.find("POST", "/api/listings/l2/requests")!;
    expect(sent.data).toMatchObject({ readingDays: 10, preferredDeliveryMethod: "MAIL", message: "Поверну вчасно" });
    await u.click(screen.getByRole("button", { name: "Зрозуміло" }));
  });

  it("власник схвалює й відхиляє заявки, читач скасовує свою", async () => {
    const u = user();
    const { srv } = renderApp("/requests", "USER");
    const approve = await screen.findAllByRole("button", { name: "Підтвердити" });
    await u.click(approve[0]);
    await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH" && /approve$/.test(c.url))).toBe(true));

    await u.click(screen.getAllByRole("button", { name: "Відхилити" })[0]);
    const dialog = await screen.findByRole("dialog");
    await u.type(within(dialog).getByRole("textbox"), "Книга вже зарезервована");
    await u.click(within(dialog).getByRole("button", { name: "Відхилити" }));
    await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH" && /reject$/.test(c.url))).toBe(true));

    await u.click(screen.getByRole("tab", { name: /Надіслані/ }));
    await u.click((await screen.findAllByRole("button", { name: "Скасувати заявку" }))[0]);
    const confirm = screen.queryByRole("alertdialog") ?? screen.queryByRole("dialog");
    if (confirm) await u.click(within(confirm).getAllByRole("button").find((b) => /Скасувати заявку|Так/.test(b.textContent ?? ""))!);
    await waitFor(() => expect(srv.calls.some((c) => c.method === "DELETE")).toBe(true));
  });
});
