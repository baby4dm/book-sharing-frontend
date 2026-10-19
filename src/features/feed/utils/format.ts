export function pluralizeComments(count: number): string {
  const lastTwo = count % 100;
  const last = count % 10;
  if (lastTwo >= 11 && lastTwo <= 14) return `${count} коментарів`;
  if (last === 1) return `${count} коментар`;
  if (last >= 2 && last <= 4) return `${count} коментарі`;
  return `${count} коментарів`;
}

export function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
