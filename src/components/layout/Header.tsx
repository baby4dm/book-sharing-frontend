import { Link, useLocation, useNavigate } from "react-router-dom";
import { getNavItems, isNavItemActive } from "./navItems";
import {
  IconBooks,
  IconLogout2,
  IconPlus,
  IconShield,
  IconUser,
} from "@tabler/icons-react";
import ModerationNavBadge from "@/features/moderation/components/ModerationNavBadge";
import { useIsModerator } from "@/features/moderation/hooks/useModeration";
import { isModeratorRole } from "@/features/moderation/types";
import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import ChatNavBadge from "@/features/chats/components/ChatNavBadge";
import UserAvatar from "@/features/userProfile/components/UserAvatar";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { springGlide } from "@/lib/motion";

function AccountMenu() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: me } = useCurrentUserProfile();
  const staff = isModeratorRole(me?.role);

  const item =
    "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium text-foreground transition-colors duration-150 hover:bg-muted focus-visible:bg-muted outline-none";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Меню акаунта"
        className="flex size-9 cursor-pointer items-center justify-center rounded-full outline-none transition-[scale,box-shadow] duration-150 ease-(--ease-out) hover:shadow-[0_0_0_3px_var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 aria-expanded:shadow-[0_0_0_3px_var(--muted)]"
      >
        <UserAvatar
          name={me?.name ?? "?"}
          src={me?.avatarUrl}
          seed={me?.id}
          className="size-8"
          fallbackClassName="text-sm"
        />
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={8} className="w-64 gap-0.5 p-1.5">
        {me && (
          <div className="mb-1 flex items-center gap-3 border-b border-border px-2.5 pt-1.5 pb-3">
            <UserAvatar
              name={me.name}
              src={me.avatarUrl}
              seed={me.id}
              className="size-9"
              fallbackClassName="text-sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{me.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {me.email}
              </p>
            </div>
          </div>
        )}
        <Link to="/profile" onClick={() => setOpen(false)} className={item}>
          <IconUser className="size-4.5 text-muted-foreground" stroke={1.75} />
          Мій профіль
        </Link>
        {!staff && (
          <Link to="/?tab=my" onClick={() => setOpen(false)} className={item}>
            <IconBooks
              className="size-4.5 text-muted-foreground"
              stroke={1.75}
            />
            Мої оголошення
          </Link>
        )}
        {staff && (
          <Link
            to="/moderation"
            onClick={() => setOpen(false)}
            className={item}
          >
            <IconShield
              className="size-4.5 text-muted-foreground"
              stroke={1.75}
            />
            Модерація
            <ModerationNavBadge className="tabular ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-white" />
          </Link>
        )}
        {!staff && (
          <Link
            to="/listings/create"
            onClick={() => setOpen(false)}
            className={item}
          >
            <IconPlus
              className="size-4.5 text-muted-foreground"
              stroke={1.75}
            />
            Додати книгу
          </Link>
        )}
        <div className="my-1 h-px bg-border" role="separator" />
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            logout();
            navigate("/");
          }}
          className={cn(item, "cursor-pointer text-destructive")}
        >
          <IconLogout2 className="size-4.5" stroke={1.75} />
          Вийти
        </button>
      </PopoverContent>
    </Popover>
  );
}

export default function Header() {
  const { pathname } = useLocation();
  const { isModerator } = useIsModerator();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card">
      <div className="mx-auto flex h-14 w-full max-w-360 items-center gap-6 px-4 lg:h-16 lg:px-8">
        <Link
          to="/"
          aria-label="bookshare — на головну"
          className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <img
            className="h-5 lg:h-6 dark:invert"
            src="/logo.svg"
            alt="bookshare"
          />
        </Link>

        <nav
          aria-label="Головна навігація"
          className="isolate hidden h-full flex-1 items-center gap-0.5 lg:flex"
        >
          {getNavItems(isModerator).map((item) => {
            const active = isNavItemActive(item.match, pathname);
            return (
              <Link
                key={item.path}
                to={item.path}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-semibold transition-colors duration-150 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="header-nav-active"
                    transition={springGlide}
                    className="absolute inset-0 -z-10 rounded-md bg-muted shadow-[inset_0_0_0_1px_var(--border)]"
                  />
                )}
                <item.icon className="size-4" stroke={active ? 2 : 1.75} />
                {item.label}
                {item.path === "/chat" && <ChatNavBadge />}
                {item.path === "/moderation" && <ModerationNavBadge />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:gap-2">
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <AccountMenu />
            </>
          ) : (
            <Button size="sm" onClick={() => navigate("/login")}>
              Увійти
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
