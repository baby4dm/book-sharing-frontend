import { isAxiosError } from "axios";

export function getErroMessage(
  error: unknown,
  fallback = 'Не вдалось виконати дію. Спробуйте ще раз."',
): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) {
      return data.message;
    }
  }
  return fallback;
}
