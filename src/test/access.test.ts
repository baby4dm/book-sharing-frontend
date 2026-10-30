import { describe, expect, it } from "vitest";
import { getNavItems, isNavItemActive } from "@/components/layout/navItems";
import { isModeratorRole } from "@/features/moderation/types";

describe("навігація за ролями", () => {
  it("звичайний користувач бачить розділи обмінів, але не модерацію", () => {
    expect(getNavItems(false).map((i) => i.path)).toEqual(["/feed", "/", "/requests", "/exchanges", "/chat"]);
  });
  it("модератор бачить лише спільноту, каталог і модерацію", () => {
    expect(getNavItems(true).map((i) => i.path)).toEqual(["/feed", "/", "/moderation"]);
  });
  it("активний пункт меню визначається за префіксом шляху", () => {
    expect(isNavItemActive(["/", "/listings"], "/listings/42")).toBe(true);
    expect(isNavItemActive(["/", "/listings"], "/exchanges")).toBe(false);
    expect(isNavItemActive(["/chat"], "/chatroom")).toBe(false);
  });
  it("роль персоналу", () => {
    expect(isModeratorRole("MODERATOR")).toBe(true);
    expect(isModeratorRole("ADMIN")).toBe(true);
    expect(isModeratorRole("USER")).toBe(false);
    expect(isModeratorRole(undefined)).toBe(false);
  });
});
