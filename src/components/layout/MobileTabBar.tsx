import { NavLink, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { springGlide } from "@/lib/motion";
import ChatNavBadge from "@/features/chats/components/ChatNavBadge";
import { cn } from "@/lib/utils";
import { isNavItemActive, navItems } from "./navItems";

export default function MobileTabBar() {
  const { pathname } = useLocation();
  if (/^\/chat\/[^/]+/.test(pathname)) return null;
  return (
    <nav
      aria-label="Головна навігація"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-xl grid-cols-5 px-2">
        {navItems.map((item) => {
          const active = isNavItemActive(item.match, pathname);
          return (
            <li key={item.path}>
              <NavLink
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-full flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-semibold transition-[color,scale] duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:scale-[0.94]",
                  active ? "text-accent-foreground" : "text-muted-foreground",
                )}
              >
                <span className="relative flex h-7 w-12 items-center justify-center">
                  {active && (
                    <motion.span
                      layoutId="tabbar-active"
                      transition={springGlide}
                      className="absolute inset-0 rounded-full bg-accent"
                    />
                  )}
                  <item.icon
                    className="relative size-5.5"
                    stroke={active ? 2 : 1.6}
                  />
                </span>
                {item.short}
                {item.path === "/chat" && (
                  <span className="absolute top-1.5 left-[calc(50%+6px)]">
                    <ChatNavBadge />
                  </span>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
