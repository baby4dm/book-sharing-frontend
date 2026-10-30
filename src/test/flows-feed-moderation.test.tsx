import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";
// @ts-expect-error тестові дані без типів
import { route } from "../../e2e/mockData.mjs";

const user = () => userEvent.setup({ delay: null });
const image = () => new File(["x"], "photo.jpg", { type: "image/jpeg" });

async function chooseAndConfirm(u: ReturnType<typeof user>, reason: RegExp | string, confirm: RegExp | string) {
  const dialog = await waitFor(() => {
    const all = screen.queryAllByRole("alertdialog").concat(screen.queryAllByRole("dialog"));
    if (!all.length) throw new Error("діалог не відкрився");
    return all[all.length - 1];
  });
  const option = within(dialog).queryByText(reason);
  if (option) await u.click(option);
  const text = within(dialog).queryByRole("textbox");
  if (text && !(text as HTMLTextAreaElement).value) await u.type(text, "Порушення правил");
  await u.click(within(dialog).getAllByRole("button", { name: confirm }).pop()!);
}

describe("стрічка спільноти", () => {
  it("новий допис з фото, вподобання й коментар", async () => {
    const u = user();
    const { srv } = renderApp("/feed", "USER", {
      "POST /api/uploads": { url: "http://localhost:8080/uploads/p.jpg" },
      "POST /api/posts": { id: "new", authorId: "u1", authorName: "Андрій Бабич", content: "Читаю «Дюну»", photoUrl: null, commentsCount: 0, likesCount: 0, likedByMe: false, createdAt: "2026-10-10T10:00:00" },
      "PUT /api/posts/p2/like": { likedByMe: true, likesCount: 5 },
      "DELETE /api/posts/p1/like": { likedByMe: false, likesCount: 11 },
      "POST /api/posts/p1/comments": { id: "c9", postId: "p1", authorId: "u1", authorName: "Андрій Бабич", content: "Згоден!", createdAt: "2026-10-10T10:00:00" },
    });
    const composer = await screen.findByPlaceholderText(/Що зараз читаєте/);
    await u.type(composer, "Читаю «Дюну»");
    const file = document.querySelector("input[type=file]") as HTMLInputElement;
    if (file) {
      await u.upload(file, image());
      const remove = screen.queryByRole("button", { name: "Прибрати фото" });
      if (remove) await u.click(remove);
    }
    await u.click(screen.getByRole("button", { name: "Опублікувати" }));
    await waitFor(() => expect(srv.find("POST", "/api/posts")).toBeTruthy());

    await u.click(screen.getAllByRole("button", { name: "Вподобати" })[0]);
    await u.click(screen.getAllByRole("button", { name: "Прибрати вподобання" })[0]);
    await waitFor(() => expect(srv.calls.some((c) => c.method === "PUT" || c.method === "DELETE")).toBe(true));

    await u.click(screen.getAllByRole("button", { name: /Коментар|коментар/ })[0]);
    const input = await screen.findByPlaceholderText("Написати коментар…");
    await u.type(input, "Згоден!");
    await u.click(screen.getByRole("button", { name: "Надіслати коментар" }));
    await waitFor(() => expect(srv.calls.some((c) => c.method === "POST" && /comments$/.test(c.url))).toBe(true));
    const more = screen.queryAllByRole("button", { name: "Читати далі" });
    if (more.length) await u.click(more[0]);
  });

  it("автор видаляє власний допис", async () => {
    const u = user();
    const own = { id: "mine", authorId: "u1", authorName: "Андрій Бабич", authorAvatarUrl: null, content: "Мій допис про книжки", photoUrl: "/p.jpg", commentsCount: 0, likesCount: 0, likedByMe: false, createdAt: "2026-10-10T10:00:00" };
    const { srv } = renderApp("/feed", "USER", { "/api/posts": { content: [own], totalElements: 1, totalPages: 1, number: 0, size: 10, first: true, last: true } });
    await screen.findByText("Мій допис про книжки");
    const photoBtn = screen.queryByRole("button", { name: "Відкрити фото повністю" });
    if (photoBtn) { await u.click(photoBtn); await u.keyboard("{Escape}"); }
    await u.click(screen.getByRole("button", { name: "Дії з постом" }));
    await u.click(await screen.findByText("Видалити пост"));
    await chooseAndConfirm(u, "—", "Видалити");
    await waitFor(() => expect(srv.find("DELETE", "/api/posts/mine")).toBeTruthy());
  });

  it("модератор видаляє чужий допис і коментар з причиною", async () => {
    const u = user();
    const { srv } = renderApp("/feed", "MODERATOR");
    await screen.findAllByText(/Музей покинутих секретів/);
    await u.click(screen.getAllByRole("button", { name: "Дії з постом" })[0]);
    await u.click(await screen.findByText("Видалити як модератор"));
    await chooseAndConfirm(u, "Спам або реклама", /Видалити/);
    await waitFor(() => expect(srv.calls.some((c) => /\/api\/moderation\/posts\/.+\/delete/.test(c.url))).toBe(true));

    await u.click(screen.getAllByRole("button", { name: /Коментар|коментар/ })[0]);
    await screen.findByText("Лінія Дарини, безперечно.");
    const del = screen.getAllByRole("button", { name: /Видалити/ });
    await u.click(del[0]);
    await chooseAndConfirm(u, "Спам або реклама", /Видалити/);
    await waitFor(() => expect(srv.calls.some((c) => /\/api\/moderation\/comments\/.+\/delete/.test(c.url))).toBe(true));
  });
});

describe("панель модерації", () => {
  it("рішення за скаргою з поясненням", async () => {
    const u = user();
    const { srv } = renderApp("/moderation/disputes/d1", "MODERATOR");
    const group = await screen.findByRole("radiogroup", { name: "Рішення по скарзі" }).catch(() => screen.findByLabelText("Рішення по скарзі"));
    await u.click(screen.getByRole("button", { name: "Ухвалити рішення" }));
    const options = within(group).queryAllByRole("radio");
    await u.click(options.length ? options[0] : within(group).getAllByRole("button")[0]);
    await u.type(screen.getByPlaceholderText(/На чому ґрунтується рішення/), "Фото підтверджують пошкодження");
    await u.click(screen.getByRole("button", { name: "Ухвалити рішення" }));
    await waitFor(() => expect(srv.find("PATCH", "/api/moderation/disputes/d1/resolve")).toBeTruthy());
  });

  it("обмеження, блокування й зняття обмеження користувача", async () => {
    const u = user();
    const { srv } = renderApp("/moderation/users/u2", "MODERATOR", { "POST /api/moderation/users/u2/restrict": {}, "POST /api/moderation/users/u6/lift": {} });
    await u.click(await screen.findByRole("button", { name: "Обмежити" }));
    let dialog = await screen.findByRole("dialog");
    await u.click(within(dialog).getByText("Спам або реклама"));
    const days = within(dialog).getByLabelText("Кількість днів");
    await u.clear(days);
    await u.type(days, "7");
    await u.click(within(dialog).getAllByRole("button").find((b) => /Обмежити|Застосувати/.test(b.textContent ?? ""))!);
    await waitFor(() => expect(srv.find("POST", "/api/moderation/users/u2/restrict")).toBeTruthy());

    await u.click(await screen.findByRole("button", { name: "Заблокувати" }));
    dialog = await screen.findByRole("dialog");
    await u.type(within(dialog).getByPlaceholderText(/Людина побачить причину/), "Повторне порушення");
    await u.click(within(dialog).getAllByRole("button", { name: "Заблокувати" }).pop()!);
    await waitFor(() => expect(srv.calls.filter((c) => c.url === "/api/moderation/users/u2/restrict")).toHaveLength(2));
  });

  it("зняття обмеження", async () => {
    const u = user();
    const { srv } = renderApp("/moderation/users/u6", "MODERATOR");
    await u.click(await screen.findByRole("button", { name: "Зняти обмеження" }));
    const dialog = await screen.findByRole("alertdialog").catch(() => screen.findByRole("dialog"));
    const reason = within(dialog).queryByText("Людина виправила ситуацію");
    if (reason) await u.click(reason);
    await u.click(within(dialog).getAllByRole("button", { name: "Зняти обмеження" }).pop()!);
    await waitFor(() => expect(srv.find("POST", "/api/moderation/users/u6/lift")).toBeTruthy());
  });

  it("адміністратор надає роль модератора", async () => {
    const u = user();
    const { srv } = renderApp("/moderation/users/u5", "ADMIN");
    await u.click(await screen.findByRole("button", { name: /Зробити модератором|Надати роль/ }));
    const dialog = screen.queryByRole("alertdialog") ?? screen.queryByRole("dialog");
    if (dialog) await u.click(within(dialog).getAllByRole("button", { name: /Надати роль|Зробити модератором/ }).pop()!);
    await waitFor(() => expect(srv.find("PATCH", "/api/moderation/users/u5/role")).toBeTruthy());
  });

  it("приховування й відновлення оголошення", async () => {
    const u = user();
    const { srv } = renderApp("/listings/l2", "MODERATOR", { "POST /api/moderation/listings/l2/hide": { ...route("GET", "/api/listings/l2", new URLSearchParams()), hiddenAt: "2026-10-10T10:00:00", hiddenReason: "Продаж" } });
    await u.click(await screen.findByRole("button", { name: "Приховати оголошення" }));
    await chooseAndConfirm(u, "Продаж замість безкоштовного обміну", /Приховати/);
    await waitFor(() => expect(srv.find("POST", "/api/moderation/listings/l2/hide")).toBeTruthy());

    const restore = renderApp("/moderation?tab=content", "MODERATOR");
    const buttons = await screen.findAllByRole("button", { name: /Повернути|Відновити/ });
    await u.click(buttons[0]);
    const dialog = screen.queryByRole("alertdialog");
    if (dialog) await u.click(within(dialog).getAllByRole("button").pop()!);
    await waitFor(() => expect(restore.srv.calls.some((c) => /restore$/.test(c.url))).toBe(true));
  });

  it("звернення користувачів: фільтри, статус і нотатка", async () => {
    const u = user();
    const items = [
      { id: "f1", topic: "BUG", email: "a@b.c", message: "Не вантажиться фото", link: "/exchanges", screenshotUrl: "/s.png", userId: "u2", userName: "Марія Коваленко", status: "NEW", moderatorNote: null, handledByName: null, createdAt: "2026-10-09T10:00:00", updatedAt: null },
      { id: "f2", topic: "QUESTION", email: "g@b.c", message: "Як обміняти книгу?", link: null, screenshotUrl: null, userId: null, userName: null, status: "RESOLVED", moderatorNote: "Відповіли", handledByName: "Андрій", createdAt: "2026-10-08T10:00:00", updatedAt: "2026-10-08T12:00:00" },
    ];
    const { srv } = renderApp("/moderation?tab=feedback", "MODERATOR", {
      "/api/feedback": { items, statusCounts: { NEW: 1, IN_PROGRESS: 0, RESOLVED: 1 }, total: 2, page: 0, totalPages: 2, totalElements: 25 },
      "PATCH /api/feedback/f1": { ...items[0], status: "IN_PROGRESS" },
    });
    await u.click(await screen.findByText("Не вантажиться фото"));
    const notes = screen.queryAllByPlaceholderText("Що зроблено, кому передано…");
    if (notes.length) {
      await u.type(notes[0], "Передано розробнику");
      await u.click(screen.getAllByRole("button", { name: "Зберегти нотатку" })[0]);
    }
    for (const status of screen.queryAllByRole("combobox", { name: "Статус" }).slice(0, 1)) await u.click(status);
    const inProgress = screen.queryAllByText("В роботі");
    if (inProgress.length) await u.click(inProgress[inProgress.length - 1]);
    const next = screen.queryByRole("button", { name: "Наступна сторінка" });
    if (next && !(next as HTMLButtonElement).disabled) await u.click(next);
    const prev = screen.queryByRole("button", { name: "Попередня сторінка" });
    if (prev && !(prev as HTMLButtonElement).disabled) await u.click(prev);
    await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH" || c.params.page === 1)).toBe(true));
  });

  it("вкладки панелі й пошук користувачів", async () => {
    const u = user();
    const { srv } = renderApp("/moderation", "MODERATOR");
    for (const tab of await screen.findAllByRole("tab")) await u.click(tab);
    await u.click(screen.getAllByRole("tab")[1]);
    const search = screen.queryAllByRole("searchbox").concat(screen.queryAllByPlaceholderText(/Ім'я|email|Пошук/i));
    if (search.length) await u.type(search[0], "Тарас");
    await waitFor(() => expect(srv.calls.some((c) => c.url === "/api/moderation/users")).toBe(true));
  });
});
