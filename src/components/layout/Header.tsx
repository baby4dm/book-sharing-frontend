import {
  IconBell,
  IconBook,
  IconLogout2,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import {
  IconHome,
  IconFileText,
  IconArrowsExchange,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/button";
import { useAuth } from "@/context/AuthContext";
import { useCurrentUserProfile } from "@/features/userProfile/hooks/useCurrentUserProfile";

const navItems = [
  { path: "/feed", label: "Спільнота", icon: IconHome },
  { path: "/", label: "Каталог", icon: IconBook },
  { path: "/requests", label: "Заявки", icon: IconFileText },
  { path: "/exchanges", label: "Обміни", icon: IconArrowsExchange },
  { path: "/chat", label: "Чат", icon: IconMessageCircle },
];
export default function Header() {
  const [navIsOpen, setNavIsOpen] = useState(false);
  const [userMenuIsOpen, setUserMenuIsOpen] = useState(false);
  const location = useLocation();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: userProfile } = useCurrentUserProfile();
  const [avatarFailed, setAvatarFailed] = useState(false);
  useEffect(() => {
    document.body.style.overflow = navIsOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [navIsOpen]);

  return (
    <header className="h-15 shadow-md px-4 py-3 flex items-center w-full bg-popover lg:h-18 lg:px-6 xl:px-12">
      <div className="flex items-center justify-between w-full">
        <img
          className="h-5 lg:h-6 dark:invert"
          src="/logo.svg"
          alt="Book share logo"
        />

        <nav className="hidden w-full lg:flex gap-2 py-4 px-2 h-full ml-6">
          {navItems.map((item) => {
            const isActive = location.pathname == item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 transition-all duration-150 py-1.5 px-5 lg:px-4 lg:gap-2 rounded-sm text-sm  ${
                  isActive
                    ? "bg-accent text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon
                  className={`stroke-1 ${isActive ? "text-accent-vivid" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {navIsOpen && (
          <nav className="lg:hidden w-full flex flex-col gap-2 fixed top-15 bottom-0 py-4 left-0 px-6 z-999 bg-popover overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname == item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setNavIsOpen(false)}
                  className={`flex items-center gap-3 transition-colors duration-150 py-1.5 px-5 rounded-sm text-sm ${
                    isActive
                      ? "bg-accent text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon
                    className={`stroke-1 ${isActive ? "text-accent-vivid" : ""}`}
                  />
                  {item.label}
                </Link>
              );
            })}
            <div className="border-t border-t-border flex w-full justify-between pt-4 px-5 items-center">
              <p className="text-muted-foreground text-sm font-light">
                Тема оформлення
              </p>
              <ThemeToggle
                clickFn={() => setNavIsOpen(false)}
                classNameIcon="stroke-1 text-muted-foreground"
              />
            </div>
            <Button
              variant="ghost"
              className="lg:hidden cursor-pointer text-muted-foreground self-end flex items-center mt-auto"
              onClick={(e) => {
                e.stopPropagation();
                setUserMenuIsOpen(false);
                logout();
                navigate("/login");
              }}
            >
              <IconLogout2 className="text-accent-vivid h-10 w-10" />
              <span className="text-base">Вийти</span>
            </Button>
          </nav>
        )}
        <div className="flex items-center gap-3 h-full lg:gap-4">
          <ThemeToggle
            classNameButton="hidden lg:flex"
            classNameIcon="stroke-1 text-muted-foreground h-7 w-auto cursor-pointer hover:text-foreground hover:scale-110 transition-all"
          />
          <IconBell className="text-muted-foreground stroke-1 h-7 w-auto cursor-pointer hover:text-foreground hover:scale-110 transition-all" />
          {isAuthenticated && (
            <div className="relative">
              <Link
                className={`h-7 w-7 rounded-full bg-primary flex 
              items-center justify-center lg:h-8 lg:w-8 cursor-pointer ${!userMenuIsOpen && "hover:scale-110"} transition-all`}
                to="/profile"
              >
                {/* <p className="text-primary-foreground text-xs font-medium">ОК</p> */}
                <div className="relative w-full h-full rounded-full overflow-hidden bg-primary flex items-center justify-center">
                  {userProfile?.avatarUrl && !avatarFailed ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={userProfile.name}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarFailed(true)}
                    />
                  ) : (
                    <p className="text-primary-foreground text-sm font-semibold">
                      {userProfile?.name.substring(0, 1).toUpperCase()}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
                navigate("/login");
              }}
              className="hidden lg:flex h-full"
            >
              <IconLogout2 className="text-muted-foreground h-7 w-auto stroke-1 cursor-pointer hover:text-foreground hover:scale-110 transition-all" />
            </button>
          )}
          <button
            onClick={() => setNavIsOpen((prev) => !prev)}
            className="lg:hidden h-7 cursor-pointer"
          >
            {!navIsOpen && (
              <IconMenu2 className="text-muted-foreground h-7 w-auto" />
            )}
            {navIsOpen && (
              <IconX className="text-muted-foreground h-7 w-auto" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
