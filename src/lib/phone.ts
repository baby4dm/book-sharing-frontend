export const PHONE_PREFIX = "+380";
const NATIONAL_LENGTH = 9;

export function toNationalDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("380") && digits.length > NATIONAL_LENGTH) {
    digits = digits.slice(3);
  }
  digits = digits.replace(/^0+/, "");
  return digits.slice(0, NATIONAL_LENGTH);
}

export function formatNational(digits: string): string {
  const parts = [
    digits.slice(0, 2),
    digits.slice(2, 5),
    digits.slice(5, 7),
    digits.slice(7, 9),
  ];
  return parts.filter(Boolean).join(" ");
}

export function caretAfterDigits(formatted: string, n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]) && ++count === n) return i + 1;
  }
  return formatted.length;
}

export function isValidPhone(value: string): boolean {
  return /^\+380\d{9}$/.test(value);
}
