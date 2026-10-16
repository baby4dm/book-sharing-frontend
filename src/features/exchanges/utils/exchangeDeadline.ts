import { daysUntil } from "@/lib/utils";
import type { ExchangeResponse } from "../types";

export interface DeadlineProgress {
  start: string;
  end: string;
  daysLeft: number;
  totalDays: number;
  percent: number;
  isOverdue: boolean;
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
  const end = exchange.extendedDeadline ?? exchange.deadline;
  const start = exchange.createdAt.slice(0, 10);
  const daysLeft = daysUntil(end);
  const elapsed = Math.max(-daysUntil(start), 0);
  const totalDays = Math.max(daysLeft + elapsed, 1);
  const percent = Math.min(100, Math.round((elapsed / totalDays) * 100));

  const returnedAt = getReturnedAt(exchange);
  const returnedLateDays = returnedAt
    ? Math.max(0, dayDiff(end, returnedAt))
    : 0;

  const bookStillWithReader =
    !returnedAt &&
    (exchange.status === "IN_READING" ||
      exchange.status === "OVERDUE" ||
      exchange.status === "RETURN_PENDING");
  const isOverdue =
    exchange.status === "OVERDUE" || (bookStillWithReader && daysLeft < 0);

  return {
    start,
    end,
    daysLeft,
    totalDays,
    percent,
    isOverdue,
    returnedAt,
    returnedLateDays,
  };
};
