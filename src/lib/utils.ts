export { cn } from "cn";

export function formatDaysAgo(createdAt: string): string {
  const days = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "Сьогодні";
  if (days === 1) return "Вчора";
  return `${days} дні тому`;
}

export const formatRelativeTime = (iso: string): string => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "щойно";
  if (minutes < 60) return `${minutes} хв тому`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} год тому`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "вчора";
  if (days < 7) {
    const word = days >= 2 && days <= 4 ? "дні" : "днів";
    return `${days} ${word} тому`;
  }

  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
  });
};

const DAY_MS = 86_400_000;

export const daysUntil = (date: string): number => {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
};

export const pluralizeDays = (count: number): string => {
  const abs = Math.abs(count);
  const lastTwo = abs % 100;
  const last = abs % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${abs} днів`;
  if (last === 1) return `${abs} день`;
  if (last >= 2 && last <= 4) return `${abs} дні`;
  return `${abs} днів`;
};

export const formatDayMonth = (value: string): string =>
  new Date(value.length > 10 ? value : `${value}T00:00:00`).toLocaleDateString(
    "uk-UA",
    { day: "numeric", month: "long" },
  );
