import { describe, expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderApp } from "./app";
describe("сторінки застосунку відображаються з даними", () => {
  it.each([
    ["/", "GUEST", "Ворошиловград"],
    ["/listings/l2", "USER", "Солодка Даруся"],
    ["/feed", "USER", "Музей покинутих секретів"],
    ["/requests", "USER", "Заявки"],
    ["/exchanges", "USER", "Обміни"],
    ["/exchanges/e3", "USER", "Солодка Даруся"],
    ["/exchanges/e1", "USER", "Лісова пісня"],
    ["/exchanges/e5", "USER", "Захар Беркут"],
    ["/chat", "USER", "Олена Шевчук"],
    ["/chat/ch2", "USER", "Можемо зустрітись біля метро Золоті ворота?"],
    ["/notifications", "USER", "Нова заявка на вашу книгу «Місто»"],
    ["/profile", "USER", "Андрій Бабич"],
    ["/users/u2", "USER", "Марія Коваленко"],
    ["/listings/create", "USER", "Знайдіть книгу"],
    ["/help", "GUEST", "Як це працює"],
    ["/terms", "GUEST", "Умови"],
    ["/privacy", "GUEST", "Політика"],
    ["/login", "GUEST", "Увійти"],
    ["/register", "GUEST", "Зареєструватися"],
    ["/moderation", "MODERATOR", "Захар Беркут"],
    ["/moderation?tab=users", "MODERATOR", "Тарас Бондар"],
    ["/moderation?tab=content", "MODERATOR", "Дюна"],
    ["/moderation?tab=feedback", "MODERATOR", "Звернення"],
    ["/moderation/disputes/d1", "MODERATOR", "Книгу повернули з розірваною обкладинкою"],
    ["/moderation/users/u6", "MODERATOR", "Тарас Бондар"],
    ["/no-such-page", "GUEST", "не знайдено"],
  ] as const)("%s (%s)", async (path, role, text) => {
    renderApp(path, role);
    await waitFor(() => expect(screen.getAllByText(new RegExp(text, "i")).length).toBeGreaterThan(0), { timeout: 4000 });
  });
});
