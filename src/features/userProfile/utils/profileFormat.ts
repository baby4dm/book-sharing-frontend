import type { PublicUserProfile } from "../types";

const SETTLEMENT_PREFIX: Record<string, string> = {
  CITY: "м.",
  SETTLEMENT: "смт",
  VILLAGE: "с.",
};

export function formatUserLocation(
  user: Pick<PublicUserProfile, "settlementType" | "settlementName" | "region">,
): string | null {
  const settlement = user.settlementName?.trim();
  const prefix = user.settlementType
    ? SETTLEMENT_PREFIX[user.settlementType]
    : "";
  const place = settlement
    ? [prefix, settlement].filter(Boolean).join(" ")
    : "";
  const parts = [place, user.region?.trim()].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function formatMemberSince(createdAt: string): string {
  const date = new Date(createdAt);
  const month = date.toLocaleDateString("uk-UA", {
    month: "long",
    day: "numeric",
  });
  const genitive = month.replace(/^\d+\s*/, "");
  return `На сервісі з ${genitive} ${date.getFullYear()}`;
}

export function pluralizeReviews(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} відгуків`;
  if (last === 1) return `${count} відгук`;
  if (last >= 2 && last <= 4) return `${count} відгуки`;
  return `${count} відгуків`;
}

export function pluralizeExchanges(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} обмінів`;
  if (last === 1) return `${count} обмін`;
  if (last >= 2 && last <= 4) return `${count} обміни`;
  return `${count} обмінів`;
}

export function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}
