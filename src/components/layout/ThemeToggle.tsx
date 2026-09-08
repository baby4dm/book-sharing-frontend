import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === "light" ? <IconMoon /> : <IconSun />}
    </button>
  );
}
