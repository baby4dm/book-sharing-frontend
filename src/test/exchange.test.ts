import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ExchangeResponse } from "@/features/exchanges/types";
import { computeExchangeSteps } from "@/features/exchanges/utils/computeExchangeSteps";
import { addDays, canRequestExtension, daysBetween, getEffectiveDeadline } from "@/features/exchanges/utils/extensions";
import { getDeadlineInfo } from "@/features/exchanges/utils/getDeadlineInfo";

const OWNER = "owner-1";
const READER = "reader-1";

function exchange(patch: Partial<ExchangeResponse> = {}): ExchangeResponse {
  return {
    id: "ex-1", listingId: "l-1", bookTitle: "Місто", ownerId: OWNER, ownerName: "Власник",
    readerId: READER, readerName: "Читач", deliveryMethod: "IN_PERSON", deadline: null,
    extendedDeadline: null, status: "HANDOVER_PENDING", handoverPhotos: [], returnPhotos: [],
    disputePhotos: [], shipments: [], extensionRequests: [], createdAt: "2026-10-01T10:00:00Z",
    completedAt: null, disputeReason: null, bookAuthor: null, bookCoverUrl: null,
    readingDays: 14, readingStartedAt: null, readingPausedDays: 0, dueDate: null,
    returnPreparedAt: null, returnedAt: null, readingPaused: false, dispute: null,
    ...patch,
  } as ExchangeResponse;
}

const photo = (by: string) => ({ id: by + "-p", url: "/p.jpg", uploadedByUserId: by, createdAt: "2026-10-02T10:00:00Z" });
const states = (e: ExchangeResponse) => computeExchangeSteps(e).map((s) => `${s.key}:${s.state}`);

describe("етапи обміну", () => {
  it("особиста зустріч: до фото власника все, крім першого кроку, заблоковано", () => {
    expect(states(exchange())).toEqual([
      "preparation:active", "with-reader:locked", "return-prep:locked", "completed:locked",
    ]);
  });

  it("після фото власника читач може підтвердити отримання", () => {
    const e = exchange({ handoverPhotos: [photo(OWNER)] } as Partial<ExchangeResponse>);
    expect(states(e)).toContain("with-reader:active");
  });

  it("доставка поштою додає етапи пересилання", () => {
    const e = exchange({ deliveryMethod: "MAIL", handoverPhotos: [photo(OWNER)] } as Partial<ExchangeResponse>);
    expect(states(e)).toEqual([
      "preparation:completed", "shipping-to-reader:active", "with-reader:locked",
      "return-prep:locked", "shipping-to-owner:locked", "completed:locked",
    ]);
  });

  it("завершений обмін має всі етапи виконаними", () => {
    const e = exchange({
      status: "COMPLETED", completedAt: "2026-10-20T10:00:00Z",
      handoverPhotos: [photo(OWNER), photo(READER)], returnPhotos: [photo(READER), photo(OWNER)],
    } as Partial<ExchangeResponse>);
    expect(computeExchangeSteps(e).every((s) => s.state === "completed")).toBe(true);
  });
});

describe("строки повернення", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-10T12:00:00")); });
  afterEach(() => vi.useRealTimers());

  it("арифметика дат", () => {
    expect(addDays("2026-10-28", 7)).toBe("2026-11-04");
    expect(daysBetween("2026-10-01", "2026-10-15")).toBe(14);
  });

  it("підсумкова дата має пріоритет над продовженням і початковою", () => {
    expect(getEffectiveDeadline(exchange({ deadline: "2026-10-20", extendedDeadline: "2026-10-25", dueDate: "2026-10-27" }))).toBe("2026-10-27");
    expect(getEffectiveDeadline(exchange({ deadline: "2026-10-20", extendedDeadline: "2026-10-25" }))).toBe("2026-10-25");
  });

  it("позначки терміновості", () => {
    expect(getDeadlineInfo("2026-10-12T12:00:00", null)).toMatchObject({ label: "Залишилось 2 дні", soon: true, urgent: false });
    expect(getDeadlineInfo("2026-10-20T12:00:00", null)).toMatchObject({ label: "Залишилось 10 днів", soon: false });
    expect(getDeadlineInfo("2026-10-05T12:00:00", null)).toMatchObject({ label: "Прострочено на 5 днів", urgent: true });
    expect(getDeadlineInfo("2026-10-05T12:00:00", "2026-10-15T12:00:00").urgent).toBe(false);
  });

  it("продовження може запросити лише читач без активного запиту", () => {
    const reading = exchange({ status: "IN_READING", dueDate: "2026-10-20" });
    expect(canRequestExtension(reading, READER)).toBe(true);
    expect(canRequestExtension(reading, OWNER)).toBe(false);
    expect(canRequestExtension(exchange({ dueDate: "2026-10-20" }), READER)).toBe(false);
    const pending = exchange({
      status: "IN_READING", dueDate: "2026-10-20",
      extensionRequests: [{ status: "PENDING" }],
    } as unknown as Partial<ExchangeResponse>);
    expect(canRequestExtension(pending, READER)).toBe(false);
  });
});
