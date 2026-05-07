import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        flex items-center justify-center
        h-10 w-10 rounded-xl
        border border-slate-200
        bg-white text-slate-700
        shadow-sm
        transition-all duration-300
        hover:scale-105
        hover:bg-slate-100

        dark:border-white/10
        dark:bg-white/[0.06]
        dark:text-yellow-300
        dark:hover:bg-white/10
      "
      aria-label="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
}