export function getDeadlineInfo(
  deadline: string,
  extendedDeadline: string | null,
): { label: string; urgent: boolean; soon: boolean } {
  const effectiveDeadline = extendedDeadline ?? deadline;
  const diffMs = new Date(effectiveDeadline).getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const daysOverdue = Math.abs(diffDays);
    return {
      label: `Прострочено на ${daysOverdue} ${pluralizeDays(daysOverdue)}`,
      urgent: true,
      soon: false,
    };
  }

  if (diffDays === 0) {
    return { label: "Сьогодні останній день", urgent: true, soon: false };
  }

  return {
    label: `Залишилось ${diffDays} ${pluralizeDays(diffDays)}`,
    urgent: false,
    soon: diffDays <= 2,
  };
}
function pluralizeDays(n: number): string {
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "днів";
  }
  if (lastDigit === 1) {
    return "день";
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "дні";
  }
  return "днів";
}
