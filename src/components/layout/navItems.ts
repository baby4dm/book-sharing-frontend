import {
  IconArrowsExchange,
  IconBook,
  IconFileText,
  IconHome,
  IconMessageCircle,
  IconShield,
} from "@tabler/icons-react";

type NavAudience = "all" | "user" | "staff";

interface NavItem {
  path: string;
  label: string;
  short: string;
  icon: typeof IconHome;
  match: string[];
  audience: NavAudience;
}

const navItems: NavItem[] = [
  {
    path: "/feed",
    label: "Спільнота",
    short: "Спільнота",
    icon: IconHome,
    match: ["/feed"],
    audience: "all",
  },
  {
    path: "/",
    label: "Каталог",
    short: "Каталог",
    icon: IconBook,
    match: ["/", "/listings"],
    audience: "all",
  },
  {
    path: "/requests",
    label: "Заявки",
    short: "Заявки",
    icon: IconFileText,
    match: ["/requests"],
    audience: "user",
  },
  {
    path: "/exchanges",
    label: "Обміни",
    short: "Обміни",
    icon: IconArrowsExchange,
    match: ["/exchanges"],
    audience: "user",
  },
  {
    path: "/chat",
    label: "Чат",
    short: "Чат",
    icon: IconMessageCircle,
    match: ["/chat"],
    audience: "user",
  },
  {
    path: "/moderation",
    label: "Модерація",
    short: "Модерація",
    icon: IconShield,
    match: ["/moderation"],
    audience: "staff",
  },
];

export function getNavItems(isModerator: boolean): NavItem[] {
  return navItems.filter((item) =>
    item.audience === "all"
      ? true
      : (item.audience === "staff") === isModerator,
  );
}

export function isNavItemActive(match: string[], pathname: string) {
  return match.some((base) =>
    base === "/"
      ? pathname === "/"
      : pathname === base || pathname.startsWith(base + "/"),
  );
}
