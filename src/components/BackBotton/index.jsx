import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function BotaoVoltar() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => navigate(-1)}
      className={`
        group flex items-center gap-2
        px-4 py-1.5 rounded-xl
        text-sm font-medium
        transition-all duration-200
        border
        ${
          isDark
            ? `
              bg-[#0b0f1a]/60
              border-purple-500/20
              text-purple-300
              hover:bg-purple-500/10
              hover:border-purple-500/40
              hover:text-purple-200
            `
            : `
              bg-white/80
              border-purple-400/30
              text-purple-700
              hover:bg-purple-100
              hover:border-purple-400/60
              hover:text-purple-800
            `
        }
        backdrop-blur-md shadow-sm
      `}
    >
      <ArrowLeft
        size={16}
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      Voltar
    </button>
  );
}
