import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { AxiosError, AxiosHeaders } from "axios";
import { classifyError, describeError, getHttpStatus } from "@/lib/errors";
import { personTint } from "@/lib/personTint";
import { caretAfterDigits } from "@/lib/phone";
import { daysUntil, formatDayMonth, formatDaysAgo, formatRelativeTime } from "@/lib/utils";
import { useDropUp } from "@/lib/useDropUp";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { collapseMotion, dropdownMotion, springGlide } from "@/lib/motion";
import { findMyActiveRequest, getActiveRequests } from "@/api/listingQueue";
import { formatDate, formatDateTime } from "@/features/moderation/utils";
import { formatMemberSince } from "@/features/userProfile/utils/profileFormat";

const axiosError = (status?: number, data: unknown = {}) =>
  new AxiosError("fail", "ERR", undefined, undefined,
    status ? { status, data, statusText: "", headers: {}, config: { headers: new AxiosHeaders() } } : undefined);
const routeError = (status: number) => ({ status, statusText: "Помилка", internal: true, data: null });

describe("класифікація помилок для екранів помилок", () => {
  it("помилки HTTP", () => {
    expect(classifyError(axiosError(404))).toBe("not-found");
    expect(classifyError(axiosError(400), { badRequestIsNotFound: true })).toBe("not-found");
    expect(classifyError(axiosError(400))).toBe("crash");
    expect(classifyError(axiosError(403))).toBe("forbidden");
    expect(classifyError(axiosError(502))).toBe("server");
    expect(classifyError(axiosError())).toBe("network");
    expect(getHttpStatus(axiosError(418))).toBe(418);
    expect(getHttpStatus(axiosError())).toBeNull();
    expect(getHttpStatus("x")).toBeNull();
  });

  it("помилки маршрутизатора", () => {
    expect(classifyError(routeError(404))).toBe("not-found");
    expect(classifyError(routeError(403))).toBe("forbidden");
    expect(classifyError(routeError(500))).toBe("server");
    expect(classifyError(routeError(401))).toBe("crash");
    expect(getHttpStatus(routeError(404))).toBe(404);
  });

  it("застаріла версія, офлайн і збій", () => {
    expect(classifyError(new Error("Failed to fetch dynamically imported module /x.js"))).toBe("outdated");
    expect(classifyError(new Error("boom"))).toBe("crash");
    const spy = vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(classifyError("x")).toBe("network");
    spy.mockRestore();
  });

  it("опис помилки для технічних деталей", () => {
    expect(describeError(axiosError(500, { message: "Внутрішня помилка" }))).toBe("HTTP 500 — Внутрішня помилка");
    expect(describeError(axiosError())).toContain("Немає відповіді");
    expect(describeError(routeError(404))).toBe("404 Помилка");
    const e = new Error("boom");
    expect(describeError(e)).toBe(e.stack);
    expect(describeError({ a: 1 })).toBe('{"a":1}');
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(describeError(cyclic)).toBe("[object Object]");
  });
});

describe("допоміжні функції", () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-10T12:00:00")); });
  afterEach(() => vi.useRealTimers());

  it("колір аватара стабільний для того самого імені", () => {
    expect(personTint("Олена")).toBe(personTint("Олена"));
    expect(personTint(null)).toMatch(/^bg-tint-/);
  });

  it("відносний час і дні", () => {
    expect(formatDaysAgo("2026-10-10T08:00:00")).toBe("Сьогодні");
    expect(formatDaysAgo("2026-10-09T08:00:00")).toBe("Вчора");
    expect(formatDaysAgo("2026-10-06T08:00:00")).toBe("4 дні тому");
    expect(formatRelativeTime("2026-10-10T11:59:40")).toBe("щойно");
    expect(formatRelativeTime("2026-10-10T11:15:00")).toBe("45 хв тому");
    expect(formatRelativeTime("2026-10-10T07:00:00")).toBe("5 год тому");
    expect(formatRelativeTime("2026-10-09T11:00:00")).toBe("вчора");
    expect(formatRelativeTime("2026-10-07T11:00:00")).toBe("3 дні тому");
    expect(formatRelativeTime("2026-10-04T11:00:00")).toBe("6 днів тому");
    expect(formatRelativeTime("2026-09-01T11:00:00")).toMatch(/1/);
    expect(daysUntil("2026-10-15")).toBe(5);
    expect(formatDayMonth("2026-10-15")).toMatch(/15/);
    expect(formatDayMonth("2026-10-15T10:00:00")).toMatch(/15/);
  });

  it("позиція курсора в номері телефону", () => {
    expect(caretAfterDigits("67 123 45 67", 0)).toBe(0);
    expect(caretAfterDigits("67 123 45 67", 3)).toBe(4);
    expect(caretAfterDigits("67 1", 9)).toBe(4);
  });

  it("дати в панелі модерації й профілі", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("2026-10-10T10:00:00")).toMatch(/2026/);
    expect(formatDateTime(undefined)).toBe("—");
    expect(formatDateTime("2026-10-10T10:05:00")).toMatch(/10:05/);
    expect(formatMemberSince("2025-03-12T10:00:00")).toMatch(/^На сервісі з .+ 2025$/);
  });

  it("налаштування анімацій визначені", () => {
    expect(springGlide.type).toBe("spring");
    expect(dropdownMotion.initial.opacity).toBe(0);
    expect(collapseMotion.animate.height).toBe("auto");
  });
});

describe("черга заявок на оголошення", () => {
  const req = (id: string, status: string, requesterId: string, createdAt: string, decidedAt: string | null = null) =>
    ({ id, status, requesterId, createdAt, decidedAt }) as never;
  const list = [
    req("p2", "PENDING", "u2", "2026-10-03"),
    req("old", "ACTIVE", "u9", "2026-09-01", "2026-09-02"),
    req("p1", "PENDING", "u1", "2026-10-01"),
    req("act", "ACTIVE", "u3", "2026-10-02", "2026-10-04"),
    req("rej", "REJECTED", "u4", "2026-10-01"),
  ];

  it("поки книга зайнята, першою йде остання схвалена заявка, далі черга за часом", () => {
    expect(getActiveRequests(list, "RESERVED").map((r) => r.id)).toEqual(["act", "p1", "p2"]);
  });

  it("коли книга вільна, стара схвалена заявка в чергу не потрапляє", () => {
    expect(getActiveRequests(list, "AVAILABLE").map((r) => r.id)).toEqual(["p1", "p2"]);
  });

  it("знаходить заявку поточного користувача", () => {
    expect(findMyActiveRequest(list, "IN_EXCHANGE", "u3")?.id).toBe("act");
    expect(findMyActiveRequest(list, "AVAILABLE", "u3")).toBeNull();
    expect(findMyActiveRequest(undefined, "AVAILABLE", "u1")).toBeNull();
    expect(findMyActiveRequest(list, "AVAILABLE", null)).toBeNull();
  });
});

describe("хуки інтерфейсу", () => {
  it("useMediaQuery реагує на зміну медіазапиту", () => {
    let matches = false;
    const listeners = new Set<() => void>();
    vi.stubGlobal("matchMedia", (q: string) => ({
      media: q,
      get matches() { return matches; },
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    }));
    const { result, unmount } = renderHook(() => useMediaQuery("(max-width: 640px)"));
    expect(result.current).toBe(false);
    act(() => { matches = true; listeners.forEach((cb) => cb()); });
    expect(result.current).toBe(true);
    unmount();
    expect(listeners.size).toBe(0);
    vi.unstubAllGlobals();
  });

  it("useDropUp відкриває список угору біля нижнього краю", () => {
    const el = document.createElement("div");
    el.getBoundingClientRect = () => ({ top: 700, bottom: 740 }) as DOMRect;
    vi.stubGlobal("innerHeight", 800);
    const ref = { current: el };
    const { result, rerender } = renderHook(({ open }) => useDropUp(ref, open), { initialProps: { open: false } });
    expect(result.current).toBe(false);
    rerender({ open: true });
    expect(result.current).toBe(true);
    el.getBoundingClientRect = () => ({ top: 10, bottom: 50 }) as DOMRect;
    rerender({ open: false });
    rerender({ open: true });
    expect(result.current).toBe(false);
    vi.unstubAllGlobals();
  });
});
