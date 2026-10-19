import { daysUntil } from "@/lib/utils";
import type { ExchangeResponse } from "../types";

export interface DeadlineProgress {
  started: boolean;
  readingDays: number;
  start: string | null;
  end: string | null;
  daysLeft: number;
  totalDays: number;
  percent: number;
  isOverdue: boolean;
  paused: boolean;
  returnedAt: string | null;
  returnedLateDays: number;
}

const DAY_MS = 86_400_000;

function dayDiff(from: string, to: string): number {
  const a = new Date(`${from.slice(0, 10)}T00:00:00`).getTime();
  const b = new Date(`${to.slice(0, 10)}T00:00:00`).getTime();
  return Math.round((b - a) / DAY_MS);
}

export function getReturnedAt(exchange: ExchangeResponse): string | null {
  if (exchange.returnedAt) return exchange.returnedAt;
  if (exchange.deliveryMethod === "MAIL") {
    const shipment = exchange.shipments.find(
      (s) =>
        s.direction === "TO_OWNER" &&
        (s.status === "SHIPPED" || s.status === "DELIVERED"),
    );
    return shipment?.shippedAt ?? null;
  }
  const photo = exchange.returnPhotos.find(
    (p) => p.uploadedByUserId === exchange.readerId,
  );
  return photo?.createdAt ?? null;
}

export const getDeadlineProgress = (
  exchange: ExchangeResponse,
): DeadlineProgress => {
  const end =
    exchange.dueDate ?? exchange.extendedDeadline ?? exchange.deadline ?? null;
  const start = exchange.readingStartedAt?.slice(0, 10) ?? null;
  const started = end !== null && exchange.status !== "HANDOVER_PENDING";
  const returnedAt = getReturnedAt(exchange);
  const paused = exchange.readingPaused;

  if (!started || !end) {
    return {
      started: false,
      readingDays: exchange.readingDays,
      start: null,
      end: null,
      daysLeft: 0,
      totalDays: exchange.readingDays,
      percent: 0,
      isOverdue: false,
      paused: false,
      returnedAt: null,
      returnedLateDays: 0,
    };
  }

  const daysLeft = daysUntil(end);
  const totalDays = Math.max(
    start ? dayDiff(start, end) : exchange.readingDays,
    1,
  );
  const elapsed = Math.max(totalDays - daysLeft, 0);
  const percent = Math.min(100, Math.round((elapsed / totalDays) * 100));
  const returnedLateDays = returnedAt
    ? Math.max(0, dayDiff(end, returnedAt))
    : 0;

  const bookStillWithReader =
    !returnedAt &&
    !paused &&
    (exchange.status === "IN_READING" ||
      exchange.status === "OVERDUE" ||
      exchange.status === "RETURN_PENDING");
  const isOverdue =
    (exchange.status === "OVERDUE" && !returnedAt) ||
    (bookStillWithReader && daysLeft < 0);

  return {
    started: true,
    readingDays: exchange.readingDays,
    start,
    end,
    daysLeft,
    totalDays,
    percent,
    isOverdue,
    paused,
    returnedAt,
    returnedLateDays,
  };
};
