import { describe, expect, it } from "vitest";
import { pluralizeDays } from "@/lib/utils";
import { pluralizeExchanges, pluralizeReviews, formatUserLocation, getInitial } from "@/features/userProfile/utils/profileFormat";
import { pluralDays } from "@/features/moderation/utils";
import { formatNational, isValidPhone, toNationalDigits } from "@/lib/phone";

describe("узгодження числівників", () => {
  it.each([
    [1, "1 день"], [2, "2 дні"], [4, "4 дні"], [5, "5 днів"], [11, "11 днів"],
    [14, "14 днів"], [21, "21 день"], [22, "22 дні"], [111, "111 днів"],
  ])("pluralizeDays(%i) = %s", (n, expected) => {
    expect(pluralizeDays(n)).toBe(expected);
    expect(pluralDays(n)).toBe(expected);
  });

  it("обміни та відгуки", () => {
    expect(pluralizeExchanges(1)).toBe("1 обмін");
    expect(pluralizeExchanges(3)).toBe("3 обміни");
    expect(pluralizeExchanges(12)).toBe("12 обмінів");
    expect(pluralizeReviews(0)).toBe("0 відгуків");
    expect(pluralizeReviews(31)).toBe("31 відгук");
  });
});

describe("номер телефону", () => {
  it("нормалізує різні формати введення", () => {
    expect(toNationalDigits("+380 67 123 45 67")).toBe("671234567");
    expect(toNationalDigits("0671234567")).toBe("671234567");
    expect(toNationalDigits("380671234567")).toBe("671234567");
  });
  it("форматує й перевіряє номер", () => {
    expect(formatNational("671234567")).toBe("67 123 45 67");
    expect(isValidPhone("+380671234567")).toBe(true);
    expect(isValidPhone("+38067123456")).toBe(false);
    expect(isValidPhone("0671234567")).toBe(false);
  });
});

describe("дані профілю", () => {
  it("формує адресу з типом населеного пункту", () => {
    expect(formatUserLocation({ settlementType: "CITY", settlementName: "Рівне", region: "Рівненська" }))
      .toBe("м. Рівне, Рівненська");
    expect(formatUserLocation({ settlementType: "VILLAGE", settlementName: "Квасилів", region: null }))
      .toBe("с. Квасилів");
    expect(formatUserLocation({ settlementType: null, settlementName: null, region: null })).toBeNull();
  });
  it("повертає ініціал або знак питання", () => {
    expect(getInitial("  дмитро")).toBe("Д");
    expect(getInitial("   ")).toBe("?");
  });
});
