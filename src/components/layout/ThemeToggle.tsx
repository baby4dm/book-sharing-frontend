import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  classNameIcon?: string;
  classNameButton?: string;
}

export function ThemeToggle({
  classNameIcon,
  classNameButton,
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className={classNameButton} onClick={toggleTheme}>
      {theme === "light" ? (
        <IconMoon className={classNameIcon} />
      ) : (
        <IconSun className={classNameIcon} />
      )}
    </button>
  );
}
