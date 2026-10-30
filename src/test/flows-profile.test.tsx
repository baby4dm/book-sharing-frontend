import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";

const user = () => userEvent.setup({ delay: null });
const image = (name = "book.jpg") => new File(["x"], name, { type: "image/jpeg" });
const BOOK = { title: "Ворошиловград", author: "Сергій Жадан", description: "Роман", genre: "Проза", coverUrl: null, isbn: "9786175850", externalId: "g1" };

describe("створення оголошення", () => {
  it("пошук книжки, деталі, фото й публікація", async () => {
    const u = user();
    const { srv, container } = { ...renderApp("/listings/create", "USER", {
      "/api/book-catalog/search": [BOOK, { ...BOOK, title: "Інтернат", externalId: "g2" }],
      "POST /api/book-catalog/resolve": { id: "b1", title: "Ворошиловград" },
      "POST /api/uploads": { url: "http://localhost:8080/uploads/x.jpg" },
      "POST /api/listings": { id: "new-1" },
    }), container: document.body };
    await u.type(await screen.findByPlaceholderText("Назва книги або автор"), "Жадан");
    await u.click(screen.getByRole("button", { name: "Знайти" }));
    await u.click(await screen.findByText("Ворошиловград"));

    await screen.findByText("Деталі оголошення");
    const fileInput = container.querySelector("input[type=file]") as HTMLInputElement;
    await u.upload(fileInput, image());
    await waitFor(() => expect(srv.find("POST", "/api/uploads")).toBeTruthy());
    await u.type(screen.getByPlaceholderText(/Легкі потертості/), "Як нова");
    await u.click(screen.getByRole("button", { name: /Пошта/ }));
    const locationSwitch = screen.getByRole("switch", { name: "Використати населений пункт із профілю" });
    await u.click(locationSwitch);
    await u.click(screen.getByRole("button", { name: "Село" }));
    await u.click(screen.getByRole("button", { name: "Селище" }));
    await u.click(screen.getByRole("button", { name: "Місто" }));
    await u.click(screen.getByText("Вибрати область"));
    await u.click(await screen.findByText("Рівненська область"));
    const town = screen.queryByPlaceholderText(/Наприклад/);
    if (town) await u.type(town, "Рівне");
    await u.click(locationSwitch);
    await u.click(screen.getByRole("button", { name: "Опублікувати оголошення" }));
    await screen.findByText("Оголошення опубліковано");
    expect(srv.find("POST", "/api/listings")!.data).toMatchObject({ conditionDescription: "Як нова" });
    await u.click(screen.getByRole("button", { name: "Переглянути оголошення" }));
  });

  it("порожній результат і ручне додавання книжки", async () => {
    const u = user();
    renderApp("/listings/create", "USER", { "/api/book-catalog/search": [] });
    await u.type(await screen.findByPlaceholderText("Назва книги або автор"), "Невідома книжка");
    await u.click(screen.getByRole("button", { name: "Знайти" }));
    await screen.findByText("Нічого не знайдено");
    await u.click(screen.getByRole("button", { name: "Додати вручну" }));
    await screen.findByText("Додати книгу вручну");
    await u.click(screen.getByRole("button", { name: "Продовжити" }));
    await u.type(screen.getByPlaceholderText("Наприклад: Затьмарення"), "Моя книжка");
    await u.type(screen.getByPlaceholderText("Наприклад: Філіп К. Дік"), "Автор");
    await u.type(screen.getByPlaceholderText("978-..."), "9781234567890");
    await u.click(screen.getByText("Вибрати жанр"));
    await u.click(await screen.findByText("Поезія"));
    await u.click(screen.getByRole("button", { name: "Продовжити" }));
    await screen.findByText("Деталі оголошення");
    await u.click(screen.getByRole("button", { name: "Опублікувати оголошення" }));
  });

  it("помилка пошуку показує повідомлення", async () => {
    const u = user();
    renderApp("/listings/create", "USER", { "/api/book-catalog/search": new Error("fail") });
    await u.type(await screen.findByPlaceholderText("Назва книги або автор"), "Жадан");
    await u.click(screen.getByRole("button", { name: "Знайти" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Не вдалося виконати пошук");
  });
});

describe("профіль і реєстрація", () => {
  it("редагування профілю з новим фото", async () => {
    const u = user();
    const { srv } = renderApp("/profile", "USER", { "POST /api/uploads": { url: "http://localhost:8080/uploads/a.jpg" }, "PATCH /api/users/me": {} });
    await u.click(await screen.findByRole("button", { name: "Редагувати профіль" }));
    const avatar = document.querySelector("input[type=file]") as HTMLInputElement;
    await u.upload(avatar, image("avatar.jpg"));
    const name = screen.getByDisplayValue("Андрій Бабич");
    await u.clear(name);
    await u.type(name, "Андрій Б.");
    await u.click(screen.getByRole("button", { name: "Село" }));
    const settlement = screen.getByPlaceholderText("Наприклад, Київ");
    await u.clear(settlement);
    await u.type(settlement, "Квасилів");
    await u.type(screen.getByPlaceholderText(/Які книги любите/), " Люблю фантастику.");
    await u.click(screen.getByRole("button", { name: "Зберегти зміни" }));
    await waitFor(() => expect(srv.find("PATCH", "/api/users/me")).toBeTruthy());
    expect(srv.find("PATCH", "/api/users/me")!.data).toMatchObject({ name: "Андрій Б.", settlementName: "Квасилів" });
  });

  it("скасування редагування профілю", async () => {
    const u = user();
    renderApp("/profile", "USER");
    await u.click(await screen.findByRole("button", { name: "Редагувати профіль" }));
    await u.click(screen.getByRole("button", { name: "Скасувати" }));
    expect(await screen.findByRole("button", { name: "Редагувати профіль" })).toBeInTheDocument();
  });

  it("реєстрація перевіряє паролі й створює акаунт", async () => {
    const u = user();
    const { srv } = renderApp("/register", "GUEST", { "POST /api/auth/register": { token: "new" } });
    await u.type(screen.getByPlaceholderText("Олег Коваленко"), "Олег");
    await u.type(screen.getByPlaceholderText("name@example.com"), "oleh@example.com");
    await u.type(screen.getByPlaceholderText("Щонайменше 8 символів"), "secret123");
    await u.type(screen.getByPlaceholderText("Повторіть пароль"), "secret12");
    await u.click(screen.getByRole("button", { name: "Зареєструватися" }));
    expect(srv.find("POST", "/api/auth/register")).toBeUndefined();
    await u.type(screen.getByPlaceholderText("Повторіть пароль"), "3");
    await u.click(screen.getByRole("button", { name: "Зареєструватися" }));
    await waitFor(() => expect(srv.find("POST", "/api/auth/register")).toBeTruthy());
  });

  it("вхід за паролем", async () => {
    const u = user();
    const { srv } = renderApp("/login", "GUEST", { "POST /api/auth/login": { token: "tok" } });
    await u.type(screen.getByPlaceholderText("name@example.com"), "andrii@bookshare.ua");
    const pass = document.querySelector("input[type=password]") as HTMLInputElement;
    await u.type(pass, "secret123");
    await u.click(within(document.querySelector("form")!).getByRole("button", { name: /Увійти/ }));
    await waitFor(() => expect(srv.find("POST", "/api/auth/login")).toBeTruthy());
  });
});
