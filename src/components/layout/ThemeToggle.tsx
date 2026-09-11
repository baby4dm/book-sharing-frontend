import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  classNameIcon?: string;
  classNameButton?: string;
  clickFn?: () => void;
}

export function ThemeToggle({
  classNameIcon,
  classNameButton,
  clickFn,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className={classNameButton}
      onClick={() => {
        toggleTheme();
        clickFn?.();
      }}
    >
      {theme === "light" ? (
        <IconMoon className={classNameIcon} />
      ) : (
        <IconSun className={classNameIcon} />
      )}
    </button>
  );
}
