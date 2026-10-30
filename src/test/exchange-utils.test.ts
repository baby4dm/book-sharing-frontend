import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { computeExchangeSteps } from "@/features/exchanges/utils/computeExchangeSteps";
import { getDeadlineProgress, getReturnedAt } from "@/features/exchanges/utils/exchangeDeadline";
import { getActionHint, getMetaLine, getPendingAction } from "@/features/exchanges/utils/exchangeListItem";
import { getErrorMessage } from "@/features/exchanges/utils/getErrorMessage";
import { getStepAction } from "@/features/exchanges/utils/getStepAction";
import { getLatestDecidedExtension, getPendingExtension, toDateInputValue } from "@/features/exchanges/utils/extensions";
import { getDeadlineInfo } from "@/features/exchanges/utils/getDeadlineInfo";
import { exchange, OWNER, READER, photo, shipment } from "./factories";

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-10T12:00:00")); });
afterEach(() => vi.useRealTimers());

const stepOf = (e: ReturnType<typeof exchange>, key: string) => computeExchangeSteps(e).find((s) => s.key === key)!;
const action = (e: ReturnType<typeof exchange>, key: string, user: string) => getStepAction(e, stepOf(e, key), user);

describe("дія на кожному етапі обміну", () => {
  it("підготовка: власник фотографує, читач чекає", () => {
    const e = exchange();
    expect(action(e, "preparation", OWNER)).toEqual({ kind: "photos", mode: "HANDOVER" });
    expect(action(e, "preparation", READER)).toMatchObject({ kind: "waiting" });
    expect(action(e, "preparation", "stranger")).toBeNull();
  });

  it("особиста передача: читач підтверджує отримання", () => {
    const e = exchange({ handoverPhotos: [photo(OWNER)] });
    expect(action(e, "with-reader", READER)).toEqual({ kind: "photos", mode: "RECEIVED" });
    expect(action(e, "with-reader", OWNER)).toMatchObject({ kind: "waiting" });
  });

  it("пошта до читача: адреса, накладна, очікування", () => {
    const noShip = exchange({ deliveryMethod: "MAIL", handoverPhotos: [photo(OWNER)] });
    expect(action(noShip, "shipping-to-reader", READER)).toEqual({ kind: "address", direction: "TO_READER" });
    expect(action(noShip, "shipping-to-reader", OWNER)).toMatchObject({ kind: "waiting", text: expect.stringContaining("адресу") });
    const pending = exchange({ deliveryMethod: "MAIL", handoverPhotos: [photo(OWNER)], shipments: [shipment("TO_READER", "PENDING")] });
    expect(action(pending, "shipping-to-reader", OWNER)).toEqual({ kind: "waybill", shipmentId: "s-TO_READER" });
    expect(action(pending, "shipping-to-reader", READER)).toMatchObject({ kind: "waiting", text: expect.stringContaining("власник відправить") });
  });

  it("повернення: читач фотографує, власник чекає", () => {
    const e = exchange({ status: "IN_READING", handoverPhotos: [photo(OWNER), photo(READER)] });
    expect(action(e, "return-prep", READER)).toEqual({ kind: "photos", mode: "RETURN" });
    expect(action(e, "return-prep", OWNER)).toMatchObject({ kind: "waiting" });
  });

  it("пошта до власника: власник вказує адресу, читач відправляє", () => {
    const base = { status: "RETURN_PENDING" as const, deliveryMethod: "MAIL" as const, handoverPhotos: [photo(OWNER), photo(READER)], returnPhotos: [photo(READER)] };
    const noShip = exchange(base);
    expect(action(noShip, "shipping-to-owner", OWNER)).toEqual({ kind: "address", direction: "TO_OWNER" });
    expect(action(noShip, "shipping-to-owner", READER)).toMatchObject({ kind: "waiting", text: expect.stringContaining("власника") });
    const pending = exchange({ ...base, shipments: [shipment("TO_OWNER", "PENDING")] });
    expect(action(pending, "shipping-to-owner", READER)).toEqual({ kind: "waybill", shipmentId: "s-TO_OWNER" });
    expect(action(pending, "shipping-to-owner", OWNER)).toMatchObject({ kind: "waiting", text: expect.stringContaining("назад") });
  });

  it("завершення: власник підтверджує повернення", () => {
    const e = exchange({ status: "RETURN_PENDING", handoverPhotos: [photo(OWNER), photo(READER)], returnPhotos: [photo(READER)] });
    expect(action(e, "completed", OWNER)).toEqual({ kind: "confirmReturn" });
    expect(action(e, "completed", READER)).toMatchObject({ kind: "waiting" });
  });

  it("неактивні етапи й невідповідні стани не мають дії", () => {
    const e = exchange({ status: "IN_READING" });
    expect(getStepAction(e, { ...stepOf(e, "preparation"), state: "active" }, OWNER)).toBeNull();
    expect(getStepAction(e, { ...stepOf(e, "with-reader"), state: "active" }, READER)).toBeNull();
    expect(getStepAction(e, { ...stepOf(e, "completed"), state: "active" }, OWNER)).toBeNull();
    expect(getStepAction(exchange({ status: "COMPLETED" }), { ...stepOf(e, "return-prep"), state: "active" }, READER)).toBeNull();
    expect(getStepAction(e, { ...stepOf(e, "preparation"), key: "unknown", state: "active" }, OWNER)).toBeNull();
    const mail = exchange({ deliveryMethod: "MAIL", status: "IN_READING" });
    expect(getStepAction(mail, { key: "shipping-to-reader", state: "active", shipment: null } as never, READER)).toBeNull();
    const shipped = exchange({ deliveryMethod: "MAIL", shipments: [shipment("TO_READER", "SHIPPED")] });
    expect(getStepAction(shipped, { key: "shipping-to-reader", state: "active", shipment: shipment("TO_READER", "SHIPPED") } as never, OWNER)).toBeNull();
  });

  it("етапи для пошти після відправлення й повернення", () => {
    const e = exchange({
      deliveryMethod: "MAIL", status: "RETURN_PENDING",
      handoverPhotos: [photo(OWNER), photo(READER)], returnPhotos: [photo(READER)],
      shipments: [shipment("TO_READER", "DELIVERED", "2026-10-02"), shipment("TO_OWNER", "SHIPPED", "2026-10-08")],
    });
    expect(computeExchangeSteps(e).map((s) => s.state)).toEqual(["completed", "completed", "completed", "completed", "completed", "active"]);
    const waitingReturn = exchange({ deliveryMethod: "MAIL", status: "IN_READING", handoverPhotos: [photo(OWNER)] });
    expect(stepOf(waitingReturn, "shipping-to-owner").state).toBe("locked");
    expect(stepOf(waitingReturn, "return-prep").state).toBe("active");
    const preparedReturn = exchange({ deliveryMethod: "MAIL", status: "RETURN_PENDING", returnPhotos: [photo(READER)] });
    expect(stepOf(preparedReturn, "shipping-to-owner").state).toBe("active");
    expect(stepOf(exchange({ deliveryMethod: "MAIL" }), "shipping-to-reader").state).toBe("locked");
  });
});

describe("дата повернення книжки", () => {
  it("береться з поля returnedAt", () => {
    expect(getReturnedAt(exchange({ returnedAt: "2026-10-05T10:00:00" }))).toBe("2026-10-05T10:00:00");
  });
  it("для пошти береться з відправлення до власника", () => {
    expect(getReturnedAt(exchange({ deliveryMethod: "MAIL", shipments: [shipment("TO_OWNER", "SHIPPED", "2026-10-06")] }))).toBe("2026-10-06");
    expect(getReturnedAt(exchange({ deliveryMethod: "MAIL", shipments: [shipment("TO_OWNER", "PENDING")] }))).toBeNull();
  });
  it("для особистої передачі береться з фото читача", () => {
    expect(getReturnedAt(exchange({ returnPhotos: [photo(READER, "2026-10-07T09:00:00")] }))).toBe("2026-10-07T09:00:00");
    expect(getReturnedAt(exchange())).toBeNull();
  });
});

describe("прогрес строку читання", () => {
  it("до початку читання прогрес не рахується", () => {
    expect(getDeadlineProgress(exchange())).toMatchObject({ started: false, percent: 0, totalDays: 14 });
  });

  it("під час читання рахує залишок і відсоток", () => {
    const p = getDeadlineProgress(exchange({ status: "IN_READING", readingStartedAt: "2026-10-03T10:00:00", dueDate: "2026-10-17" }));
    expect(p).toMatchObject({ started: true, daysLeft: 7, totalDays: 14, percent: 50, isOverdue: false });
  });

  it("позначає прострочення, поки книга в читача", () => {
    const p = getDeadlineProgress(exchange({ status: "IN_READING", readingStartedAt: "2026-09-20T10:00:00", dueDate: "2026-10-04" }));
    expect(p).toMatchObject({ isOverdue: true, percent: 100 });
    expect(getDeadlineProgress(exchange({ status: "OVERDUE", dueDate: "2026-10-04", readingStartedAt: null })).isOverdue).toBe(true);
  });

  it("враховує запізнення повернення й паузу", () => {
    const late = getDeadlineProgress(exchange({ status: "RETURN_PENDING", dueDate: "2026-10-04", readingStartedAt: "2026-09-20", returnedAt: "2026-10-07T10:00:00" }));
    expect(late).toMatchObject({ returnedLateDays: 3, isOverdue: false });
    const paused = getDeadlineProgress(exchange({ status: "RETURN_PENDING", dueDate: "2026-10-04", readingPaused: true }));
    expect(paused).toMatchObject({ paused: true, isOverdue: false });
  });
});

describe("рядок стану в списку обмінів", () => {
  it("завершений, спір і очікування передачі", () => {
    expect(getMetaLine(exchange({ status: "COMPLETED", completedAt: "2026-10-05T10:00:00" }), true).text).toContain("Повернено");
    expect(getMetaLine(exchange({ status: "DISPUTED" }), true)).toEqual({ text: "Відкрито спір", tone: "danger" });
    expect(getMetaLine(exchange(), false).text).toContain("14 днів на читання");
    expect(getMetaLine(exchange({ status: "IN_READING" }), false).text).toBe("14 днів на читання");
  });

  it("читання: залишок, останній день, прострочення", () => {
    expect(getMetaLine(exchange({ status: "IN_READING", dueDate: "2026-10-20" }), false)).toEqual({ text: "Залишилось 10 днів", tone: "default" });
    expect(getMetaLine(exchange({ status: "IN_READING", dueDate: "2026-10-12" }), false).tone).toBe("warning");
    expect(getMetaLine(exchange({ status: "IN_READING", dueDate: "2026-10-10" }), false).text).toBe("Сьогодні останній день");
    expect(getMetaLine(exchange({ status: "OVERDUE", dueDate: "2026-10-07" }), false)).toEqual({ text: "Прострочено на 3 дні", tone: "danger" });
  });

  it("повернення: різні формулювання для власника й читача", () => {
    const returned = exchange({ status: "RETURN_PENDING", dueDate: "2026-10-20", returnedAt: "2026-10-09T10:00:00" });
    expect(getMetaLine(returned, false).text).toBe("Очікуємо підтвердження власника");
    expect(getMetaLine(returned, true).text).toContain("Читач повернув книгу");
    expect(getMetaLine({ ...returned, deliveryMethod: "MAIL" }, true).text).toContain("відправив");
    const paused = exchange({ status: "RETURN_PENDING", dueDate: "2026-10-20", readingPaused: true });
    expect(getMetaLine(paused, true).tone).toBe("warning");
    expect(getMetaLine(paused, false).text).toContain("на паузі");
    expect(getMetaLine(exchange({ status: "RETURN_PENDING", dueDate: "2026-10-05" }), false).tone).toBe("danger");
    expect(getMetaLine(exchange({ status: "RETURN_PENDING", dueDate: "2026-10-12" }), true).text).toBe("Читач готує книгу до повернення");
    expect(getMetaLine(exchange({ status: "RETURN_PENDING", dueDate: "2026-10-20", deliveryMethod: "MAIL" }), false).text).toContain("Відправте");
  });

  it("найближча дія користувача й підказка до неї", () => {
    const e = exchange();
    const a = getPendingAction(e, OWNER)!;
    expect(a).toEqual({ kind: "photos", mode: "HANDOVER" });
    expect(getActionHint(a, e)).toBe("Додайте фото книги перед передачею");
    expect(getActionHint(a, exchange({ deliveryMethod: "MAIL" }))).toBe("Додайте фото книги перед відправкою");
    expect(getPendingAction(e, READER)).toBeNull();
    expect(getActionHint({ kind: "photos", mode: "RECEIVED" }, e)).toBe("Підтвердьте отримання книги");
    expect(getActionHint({ kind: "photos", mode: "RETURN" }, e)).toContain("поверніть");
    expect(getActionHint({ kind: "address", direction: "TO_OWNER" }, e)).toBe("Вкажіть адресу доставки");
    expect(getActionHint({ kind: "waybill", shipmentId: "s" }, e)).toBe("Додайте фото накладної");
    expect(getActionHint({ kind: "confirmReturn" }, e)).toBe("Підтвердьте повернення книги");
    expect(getActionHint({ kind: "waiting", text: "Чекаємо" }, e)).toBe("Чекаємо");
  });
});

describe("продовження строку й повідомлення про помилки", () => {
  it("знаходить активний і останній розглянутий запит", () => {
    const e = exchange({ extensionRequests: [
      { id: "a", status: "APPROVED", decidedAt: "2026-10-01" },
      { id: "b", status: "REJECTED", decidedAt: "2026-10-05" },
      { id: "c", status: "PENDING", decidedAt: null },
    ] as never });
    expect(getPendingExtension(e)?.id).toBe("c");
    expect(getLatestDecidedExtension(e)?.id).toBe("b");
    expect(getLatestDecidedExtension(exchange())).toBeNull();
    expect(toDateInputValue(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("позначка терміну для однини й продовження", () => {
    expect(getDeadlineInfo("2026-10-11T12:00:00", null).label).toBe("Залишилось 1 день");
    expect(getDeadlineInfo("2026-10-21T12:00:00", null).label).toBe("Залишилось 11 днів");
    expect(getDeadlineInfo("2026-10-10T12:00:00", null)).toMatchObject({ label: "Сьогодні останній день", urgent: true });
    expect(getDeadlineInfo("2026-10-05T12:00:00", null).label).toBe("Прострочено на 5 днів");
  });

  it("бере повідомлення сервера або запасний текст", () => {
    const err = new AxiosError("x", "400", undefined, undefined, { data: { message: "Заявку вже розглянуто" }, status: 400, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } });
    expect(getErrorMessage(err)).toBe("Заявку вже розглянуто");
    expect(getErrorMessage(new AxiosError("x"), "Помилка")).toBe("Помилка");
    expect(getErrorMessage(new Error("x"))).toContain("Не вдалось");
  });
});
