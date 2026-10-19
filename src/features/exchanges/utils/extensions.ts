import type { DeadlineExtensionResponse, ExchangeResponse } from "../types";

const DAY_MS = 86_400_000;

function parseDate(date: string): Date {
  return new Date(date.length === 10 ? `${date}T00:00:00` : date);
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: string, days: number): string {
  const result = parseDate(date);
  result.setDate(result.getDate() + days);
  return toDateInputValue(result);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / DAY_MS);
}

export function getEffectiveDeadline(
  exchange: ExchangeResponse,
): string | null {
  return exchange.dueDate ?? exchange.extendedDeadline ?? exchange.deadline;
}

export function getPendingExtension(
  exchange: ExchangeResponse,
): DeadlineExtensionResponse | null {
  return exchange.extensionRequests.find((r) => r.status === "PENDING") ?? null;
}

export function getLatestDecidedExtension(
  exchange: ExchangeResponse,
): DeadlineExtensionResponse | null {
  const decided = exchange.extensionRequests.filter(
    (r) => r.status !== "PENDING" && r.decidedAt,
  );
  if (decided.length === 0) return null;
  return decided.reduce((latest, r) =>
    (r.decidedAt ?? "") > (latest.decidedAt ?? "") ? r : latest,
  );
}

export function canRequestExtension(
  exchange: ExchangeResponse,
  currentUserId: string,
): boolean {
  return (
    exchange.readerId === currentUserId &&
    (exchange.status === "IN_READING" || exchange.status === "OVERDUE") &&
    getEffectiveDeadline(exchange) !== null &&
    getPendingExtension(exchange) === null
  );
}
