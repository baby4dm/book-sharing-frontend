import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";

const user = () => userEvent.setup({ delay: null });
const listingsPage = (number: number, last: boolean) => (c: { params: { page: number } }) => ({
  content: [{ id: `p${c.params.page}`, ownerId: "u2", ownerName: "Марія", bookTitle: `Книжка ${c.params.page}`, bookAuthor: "Автор", bookCoverUrl: null, bookGenre: "Проза", status: "AVAILABLE", deliveryMethods: ["PICKUP"], photoUrls: [], createdAt: "2026-10-01T10:00:00", settlementName: "Київ", region: "Київська область", settlementType: "CITY" }],
  number: c.params.page, last: c.params.page >= number ? true : last, totalElements: 2, totalPages: 2, size: 1, first: c.params.page === 0,
});

describe("шапка, сповіщення, каталог і заявки", () => {
  it("меню акаунта: профіль, мої оголошення, вихід", async () => {
    const u = user();
    const { memory } = renderApp("/", "USER");
    await u.click(await screen.findByRole("button", { name: "Меню акаунта" }));
    await u.click(await screen.findByText("Мій профіль"));
    await waitFor(() => expect(memory.state.location.pathname).toBe("/profile"));
    await u.click(screen.getByRole("button", { name: "Меню акаунта" }));
    await u.click(await screen.findByText("Мої оголошення"));
    await waitFor(() => expect(memory.state.location.search).toContain("tab=my"));
    await u.click(screen.getByRole("button", { name: "Меню акаунта" }));
    await u.click(await screen.findByText("Вийти"));
    await waitFor(() => expect(localStorage.getItem("authToken")).toBeNull());
  });

  it("дзвіночок сповіщень: перегляд, прочитання всіх і перехід", async () => {
    const u = user();
    const { srv, memory } = renderApp("/", "USER");
    await u.click(await screen.findByRole("button", { name: "Сповіщення" }));
    await screen.findAllByText("Нова заявка на вашу книгу «Місто»");
    await u.click(screen.getByRole("button", { name: "Прочитати всі" }));
    await waitFor(() => expect(srv.find("PATCH", "/api/notifications/read-all")).toBeTruthy());
    const item = screen.getAllByText("Нова заявка на вашу книгу «Місто»").pop()!;
    await u.click(item);
    await waitFor(() => expect(memory.state.location.pathname).toBe("/requests"));
  });

  it("каталог: вкладка моїх оголошень і підвантаження сторінок", async () => {
    const u = user();
    const { srv } = renderApp("/", "USER", { "/api/listings": listingsPage(1, false), "/api/listings/my": listingsPage(0, true) });
    await screen.findByText("Книжка 0");
    await u.click(screen.getByRole("button", { name: "Завантажити ще" }));
    expect(await screen.findByText("Книжка 1")).toBeInTheDocument();
    await u.click(screen.getAllByRole("tab")[1]);
    await waitFor(() => expect(srv.calls.some((c) => c.url === "/api/listings/my")).toBe(true));
  });

  it("порожній каталог і помилка завантаження", async () => {
    const u = user();
    renderApp("/", "USER", { "/api/listings": { content: [], number: 0, last: true, totalElements: 0, totalPages: 0, size: 12, first: true } });
    expect(await screen.findByText("Нічого не знайдено")).toBeInTheDocument();
    const { srv } = renderApp("/", "USER", { "/api/listings": new Error("fail") });
    await u.click(await screen.findByRole("button", { name: "Спробувати ще раз" }));
    await waitFor(() => expect(srv.calls.filter((c) => c.url === "/api/listings").length).toBeGreaterThan(1));
  });

  it("заявки: пошук, сортування, фільтр і сторінки", async () => {
    const u = user();
    const page = (c: { params: Record<string, unknown> }) => ({
      items: route(c), statusCounts: { PENDING: 1, ACTIVE: 0, REJECTED: 0, CANCELLED: 0 }, total: 30, page: Number(c.params.page ?? 0), totalPages: 3, totalElements: 30,
    });
    const route = (c: { params: Record<string, unknown> }) => [{ id: `r${c.params.page}`, listingId: "l1", listingBookTitle: `Заявка ${c.params.page}`, requesterId: "u2", requesterName: "Марія", requesterAvatarUrl: null, requesterRatingAvg: 4.5, readingDays: 14, preferredDeliveryMethod: "PICKUP", message: null, status: "PENDING", rejectComment: null, createdAt: "2026-10-01T10:00:00", decidedAt: null, exchangeId: null }];
    const { srv } = renderApp("/requests", "USER", { "/api/requests/received": page });
    await screen.findByText("Заявка 0");
    await u.type(screen.getByPlaceholderText("Назва книги або ім'я читача"), "Марія");
    await waitFor(() => expect(srv.calls.some((c) => c.params.q === "Марія")).toBe(true), { timeout: 3000 });
    await u.click(screen.getByRole("button", { name: "Наступна сторінка" }));
    await waitFor(() => expect(srv.calls.some((c) => c.params.page === 1)).toBe(true));
    await u.click(screen.getByRole("button", { name: "Попередня сторінка" }));
    const nav = screen.getByRole("navigation", { name: "Сторінки" });
    await u.click(within(nav).getByRole("button", { name: "3" }));
    const sort = screen.getAllByRole("button").find((b) => /Спочатку нові|Сортування/.test(b.textContent ?? "") || b.getAttribute("aria-label") === "Сортування");
    if (sort) {
      await u.click(sort);
      const opt = await screen.findAllByText("Найвищий рейтинг читача");
      await u.click(opt[opt.length - 1]);
    }
    const delivery = screen.getAllByRole("button").find((b) => /Спосіб|Доставка/.test(b.textContent ?? ""));
    if (delivery) {
      await u.click(delivery);
      const opt = await screen.findAllByText("Поштою");
      await u.click(opt[opt.length - 1]);
    }
    const chips = screen.queryAllByRole("button").filter((b) => /Очікують|Нові|Відхилені/.test(b.textContent ?? ""));
    if (chips[0]) await u.click(chips[0]);
    await waitFor(() => expect(srv.calls.some((c) => c.params.sort || c.params.deliveryMethod || c.params.status)).toBe(true));
  });
});
