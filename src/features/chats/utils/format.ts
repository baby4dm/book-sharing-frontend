const DAY_MS = 86_400_000;

function startOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function daysBetween(date: Date, now: Date): number {
  return Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayLabel(iso: string, now: Date): string {
  const date = new Date(iso);
  const diff = daysBetween(date, now);
  if (diff === 0) return "Сьогодні";
  if (diff === 1) return "Вчора";
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "long",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "numeric" }),
  });
}

export function formatListTime(iso: string, now: Date): string {
  const date = new Date(iso);
  const diff = daysBetween(date, now);
  if (diff === 0) return formatTime(iso);
  if (diff === 1) return "вчора";
  if (diff < 7) return date.toLocaleDateString("uk-UA", { weekday: "short" });
  return date.toLocaleDateString("uk-UA", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: "2-digit" }),
  });
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

export function isSameGroup(
  a: { senderId: string; createdAt: string },
  b: { senderId: string; createdAt: string },
): boolean {
  return (
    a.senderId === b.senderId &&
    isSameDay(a.createdAt, b.createdAt) &&
    Math.abs(
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ) <
      5 * 60_000
  );
}
