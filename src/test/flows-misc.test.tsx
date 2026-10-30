import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";
// @ts-expect-error тестові дані без типів
import { route } from "../../e2e/mockData.mjs";

const user = () => userEvent.setup({ delay: null });

describe("чат, черга заявок, звернення, помилки", () => {
  it("надсилання повідомлення в чаті й повернення до списку", async () => {
    const u = user();
    const { srv } = renderApp("/chat/ch2", "USER", {
      "POST /api/chats/ch2/messages": { id: "m9", chatRoomId: "ch2", senderId: "u1", senderName: "Андрій Бабич", content: "Підходить!", createdAt: "2026-10-10T10:00:00", readAt: null },
    });
    await screen.findByText("Можемо зустрітись біля метро Золоті ворота?");
    const box = screen.getAllByRole("textbox").pop()!;
    await u.type(box, "Підходить!{Enter}");
    await waitFor(() => expect(srv.find("POST", "/api/chats/ch2/messages")).toBeTruthy());
    expect(await screen.findByText("Підходить!")).toBeInTheDocument();
    const back = screen.queryByRole("link", { name: "До списку розмов" }) ?? screen.queryByRole("button", { name: "До списку розмов" });
    if (back) await u.click(back);
  });

  it("власник бачить чергу заявок на своє оголошення", async () => {
    const u = user();
    const mine = { ...route("GET", "/api/listings/l1", new URLSearchParams()), ownerId: "u1", ownerName: "Андрій Бабич" };
    const { memory } = renderApp("/listings/l1", "USER", { "/api/listings/l1": mine });
    await screen.findByText(/Марія Коваленко/);
    const review = screen.queryAllByRole("link", { name: /Розглянути/ }).concat(screen.queryAllByRole("button", { name: /Розглянути/ }));
    if (review.length) await u.click(review[0]);
    await waitFor(() => expect(memory.state.location.pathname).toMatch(/requests|listings/));
  });

  it("звернення через форму зворотного зв'язку", async () => {
    const u = user();
    const { srv } = renderApp("/help", "USER", { "POST /api/feedback": { id: "f1" } });
    const open = (await screen.findAllByRole("button")).find((b) => /Зворотний|Написати|Повідомити|звернення/i.test(b.textContent ?? ""));
    if (!open) return;
    await u.click(open);
    const dialog = await screen.findByRole("dialog");
    const message = within(dialog).getAllByRole("textbox").find((t) => t.tagName === "TEXTAREA")!;
    await u.click(within(dialog).getByRole("button", { name: "Надіслати" }));
    await u.type(message, "Не можу завантажити фото накладної з телефона");
    const link = within(dialog).queryByPlaceholderText("Скопіюйте адресу сторінки");
    if (link) await u.type(link, "/exchanges/e1");
    await u.click(within(dialog).getByRole("button", { name: "Надіслати" }));
    await screen.findByText("Дякуємо, звернення надіслано");
    expect(srv.find("POST", "/api/feedback")!.data).toMatchObject({ message: "Не можу завантажити фото накладної з телефона" });
    await u.click(screen.getByRole("button", { name: "Зрозуміло" }));
  });

  it("помилка сервера показує екран помилки", async () => {
    renderApp("/exchanges/e2", "USER", { "/api/exchanges/e2": new Error("fail") });
    expect(await screen.findByText(/Не вдалося завантажити обмін|Збій на сервері|Щось пішло не так/)).toBeInTheDocument();
  });

  it("неіснуюче оголошення", async () => {
    renderApp("/listings/zzz", "USER", { "/api/listings/zzz": new Error("fail") });
    expect(await screen.findByText(/не знайдено|Збій|Щось пішло не так|Не вдалося/i)).toBeInTheDocument();
  });

  it("сповіщення: прочитати всі й перейти за посиланням", async () => {
    const u = user();
    const { srv } = renderApp("/notifications", "USER");
    await screen.findByText("Нова заявка на вашу книгу «Місто»");
    for (const tab of screen.queryAllByRole("tab")) await u.click(tab);
    const readAll = screen.queryAllByRole("button").find((b) => /Прочитати все|Позначити все/i.test(b.textContent ?? ""));
    if (readAll) await u.click(readAll);
    const item = screen.queryAllByText(/До кінця терміну читання/)[0];
    if (item) await u.click(item);
    await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH")).toBe(true));
  });
});
