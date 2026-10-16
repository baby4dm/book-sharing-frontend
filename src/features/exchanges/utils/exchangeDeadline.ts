import { daysUntil } from "@/lib/utils";
import type { ExchangeResponse } from "../types";

export interface DeadlineProgress {
  start: string;
  end: string;
  daysLeft: number;
  totalDays: number;
  percent: number;
  isOverdue: boolean;
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
  const isOverdue =
    exchange.status === "OVERDUE" ||
    (exchange.status === "IN_READING" && daysLeft < 0);

  return { start, end, daysLeft, totalDays, percent, isOverdue };
};
