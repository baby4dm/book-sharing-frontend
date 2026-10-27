import {
  IconArrowsExchange,
  IconBook,
  IconFileText,
  IconHome,
  IconMessageCircle,
} from "@tabler/icons-react";

export const navItems = [
  {
    path: "/feed",
    label: "Спільнота",
    short: "Спільнота",
    icon: IconHome,
    match: ["/feed"],
  },
  {
    path: "/",
    label: "Каталог",
    short: "Каталог",
    icon: IconBook,
    match: ["/", "/listings"],
  },
  {
    path: "/requests",
    label: "Заявки",
    short: "Заявки",
    icon: IconFileText,
    match: ["/requests"],
  },
  {
    path: "/exchanges",
    label: "Обміни",
    short: "Обміни",
    icon: IconArrowsExchange,
    match: ["/exchanges"],
  },
  {
    path: "/chat",
    label: "Чат",
    short: "Чат",
    icon: IconMessageCircle,
    match: ["/chat"],
  },
];

export function isNavItemActive(match: string[], pathname: string) {
  return match.some((base) =>
    base === "/"
      ? pathname === "/"
      : pathname === base || pathname.startsWith(base + "/"),
  );
}
