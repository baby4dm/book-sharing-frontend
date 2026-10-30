import { describe, expect, it } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderApp } from "./app";
// @ts-expect-error тестові дані без типів
import { route } from "../../e2e/mockData.mjs";

const user = () => userEvent.setup({ delay: null });
const image = () => new File(["x"], "book.jpg", { type: "image/jpeg" });
const base = (id: string) => route("GET", `/api/exchanges/${id}`, new URLSearchParams());
const photo = (by: string, stage = "HANDOVER") => ({ id: `${by}-${stage}`, uploadedByUserId: by, uploadedByName: "x", stage, url: "/p.jpg", note: null, createdAt: "2026-10-01T10:00:00" });
const upload = { "POST /api/uploads": { url: "http://localhost:8080/uploads/x.jpg" } };
const fileInput = () => document.querySelector("input[type=file]") as HTMLInputElement;

async function confirmIfAsked(u: ReturnType<typeof user>) {
  const dialogs = screen.queryAllByRole("alertdialog").concat(screen.queryAllByRole("dialog"));
  for (const d of dialogs) {
    const btn = within(d).queryAllByRole("button").find((b) => /Підтвердити|Так/.test(b.textContent ?? ""));
    if (btn) { await u.click(btn); return; }
  }
}

describe("дії на сторінці обміну", () => {
  it("власник надсилає фото перед передачею", async () => {
    const u = user();
    const { srv } = renderApp("/exchanges/e1", "USER", upload);
    await screen.findByText("Хід обміну");
    await u.upload(fileInput(), image());
    await u.click(await screen.findByRole("button", { name: "Надіслати фото" }));
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e1/handover-photos")).toBeTruthy());
  });

  it("читач підтверджує отримання з фото", async () => {
    const u = user();
    const ex = { ...base("e1"), ownerId: "u4", readerId: "u1", deliveryMethod: "PICKUP", handoverPhotos: [photo("u4")] };
    const { srv } = renderApp("/exchanges/e1", "USER", { ...upload, "/api/exchanges/e1": ex });
    await screen.findByText("Хід обміну");
    await u.upload(fileInput(), image());
    await u.click(await screen.findByRole("button", { name: "Підтвердити отримання" }));
    await confirmIfAsked(u);
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e1/confirm-received")).toBeTruthy());
  });

  it("читач вказує адресу доставки поштою", async () => {
    const u = user();
    const ex = { ...base("e1"), ownerId: "u4", readerId: "u1", deliveryMethod: "MAIL", handoverPhotos: [photo("u4")] };
    const { srv } = renderApp("/exchanges/e1", "USER", { "/api/exchanges/e1": ex });
    await u.click(await screen.findByRole("button", { name: "Зберегти адресу" }));
    expect(await screen.findByText("Вкажіть ім'я")).toBeInTheDocument();
    const inputs = screen.getAllByRole("textbox");
    const form = inputs[0].closest("div")!.parentElement!.parentElement!;
    void form;
    await u.type(inputs[0], "Андрій Бабич");
    await u.type(document.getElementById("shipment-phone") as HTMLInputElement, "671234567");
    const rest = screen.getAllByRole("textbox").filter((i) => !(i as HTMLInputElement).value);
    for (const [idx, el] of rest.entries()) await u.type(el, ["Київ", "12"][idx] ?? "1");
    await u.click(screen.getByRole("button", { name: "Зберегти адресу" }));
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e1/shipment")).toBeTruthy());
    expect(srv.find("POST", "/api/exchanges/e1/shipment")!.data).toMatchObject({ recipientPhone: "+380671234567", direction: "TO_READER" });
  });

  it("власник додає фото накладної", async () => {
    const u = user();
    const ex = { ...base("e1"), deliveryMethod: "MAIL", handoverPhotos: [photo("u1")],
      shipments: [{ id: "s1", direction: "TO_READER", recipientName: "Ігор", recipientPhone: "+380671234567", carrier: "NOVA_POSHTA", city: "Київ", branchNumber: "5", waybillPhotoUrl: null, status: "PENDING", shippedAt: null, deliveredAt: null }] };
    const { srv } = renderApp("/exchanges/e1", "USER", { ...upload, "/api/exchanges/e1": ex });
    await screen.findByText("Хід обміну");
    await u.upload(fileInput(), image());
    await u.click(await screen.findByRole("button", { name: "Позначити як відправлене" }));
    await confirmIfAsked(u);
    await waitFor(() => expect(srv.find("PATCH", "/api/exchanges/e1/shipment/s1/ship")).toBeTruthy());
  });

  it("читач просить продовжити строк і надсилає фото повернення", async () => {
    const u = user();
    const { srv } = renderApp("/exchanges/e2", "USER", upload);
    await u.click(await screen.findByRole("button", { name: "Попросити більше часу" }));
    const dialog = await screen.findByRole("dialog");
    await u.click(within(dialog).getByRole("button", { name: "Інше" }));
    const days = within(dialog).getByRole("spinbutton");
    await u.clear(days);
    await u.type(days, "10");
    await u.type(within(dialog).getByPlaceholderText(/захворів/), "Захворів");
    await u.click(within(dialog).getByRole("button", { name: "Надіслати запит" }));
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e2/extension-requests")).toBeTruthy());

    await u.upload(fileInput(), image());
    await u.click(await screen.findByRole("button", { name: "Надіслати фото повернення" }));
    await confirmIfAsked(u);
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e2/return-photos")).toBeTruthy());
  });

  it.each(["approve", "reject"] as const)("власник розглядає запит на продовження (%s)", async (decision) => {
    const u = user();
    const pending = { id: "x1", extraDays: 7, requestedNewDeadline: "2026-11-20", status: "PENDING", comment: "Іспити", decisionComment: null, createdAt: "2026-10-05T10:00:00", decidedAt: null };
    const ex = { ...base("e3"), extensionRequests: [pending] };
    const { srv } = renderApp("/exchanges/e3", "USER", { "/api/exchanges/e3": ex });
    const card = await screen.findByLabelText("Запит на продовження дедлайну");
    if (decision === "approve") {
      await u.click(within(card).getByRole("button", { name: "Прийняти" }));
      await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH" && c.params.approve === true)).toBe(true));
    } else {
      await u.click(within(card).getByRole("button", { name: "Відхилити" }));
      await u.click(within(card).getByRole("button", { name: "Назад" }));
      await u.click(within(card).getByRole("button", { name: "Відхилити" }));
      await u.type(within(card).getByPlaceholderText(/книга потрібна/), "Книга потрібна мені");
      await u.click(within(card).getByRole("button", { name: "Відхилити запит" }));
      await waitFor(() => expect(srv.calls.some((c) => c.method === "PATCH" && c.params.approve === false)).toBe(true));
    }
  });

  it("власник підтверджує повернення або відкриває спір", async () => {
    const u = user();
    const ex = { ...base("e3"), status: "RETURN_PENDING", deliveryMethod: "PICKUP", handoverPhotos: [photo("u1"), photo("u5")], returnPhotos: [photo("u5", "RETURN")], returnedAt: "2026-10-08T10:00:00" };
    const { srv } = renderApp("/exchanges/e3", "USER", { ...upload, "/api/exchanges/e3": ex });
    await u.click(await screen.findByRole("button", { name: /Є проблема/ }));
    const dialog = await screen.findByRole("dialog");
    await u.click(within(dialog).getByRole("button", { name: "Відкрити спір" }));
    await u.type(within(dialog).getByPlaceholderText(/плями/), "Плями на сторінках");
    await u.upload((dialog.querySelector("input[type=file]") as HTMLInputElement) ?? fileInput(), image());
    await u.click(within(dialog).getByRole("button", { name: "Відкрити спір" }));
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e3/dispute")).toBeTruthy());

    await u.click(screen.getAllByRole("button", { name: "Підтвердити повернення" })[0]);
    await confirmIfAsked(u);
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e3/confirm-return")).toBeTruthy());
  });

  it("після завершення можна залишити відгук", async () => {
    const u = user();
    const { srv } = renderApp("/exchanges/e4", "USER");
    await screen.findByText("Як пройшов обмін?");
    await u.click(screen.getByRole("button", { name: "5 з 5" }));
    await u.type(screen.getByPlaceholderText(/Стан книги/), "Все чудово");
    await u.click(screen.getByRole("button", { name: "Надіслати відгук" }));
    await waitFor(() => expect(srv.find("POST", "/api/exchanges/e4/reviews")).toBeTruthy());
    expect(srv.find("POST", "/api/exchanges/e4/reviews")!.data).toMatchObject({ rating: 5 });
  });

  it("список обмінів: пошук, фільтри й перехід до обміну", async () => {
    const u = user();
    const { srv, memory } = renderApp("/exchanges", "USER");
    await u.type(await screen.findByPlaceholderText("Назва книги або ім'я"), "Даруся");
    await waitFor(() => expect(srv.calls.some((c) => c.url === "/api/exchanges/my/search" && c.params.q === "Даруся")).toBe(true), { timeout: 3000 });
    for (const tab of screen.queryAllByRole("tab")) await u.click(tab);
    const link = (await screen.findAllByRole("link")).find((a) => /\/exchanges\/e\d/.test(a.getAttribute("href") ?? ""));
    if (link) { await u.click(link); await waitFor(() => expect(memory.state.location.pathname).toMatch(/\/exchanges\/e\d/)); }
  });
});
