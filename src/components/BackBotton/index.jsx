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
        group relative overflow-hidden
        inline-flex items-center gap-2
        rounded-2xl border px-4 py-2.5
        text-sm font-black
        backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-0.5
        active:scale-[0.98]
        ${
          isDark
            ? `
              border-white/10
              bg-white/[0.04]
              text-slate-200
              hover:bg-white/[0.07]
              hover:border-cyan-400/30
              shadow-lg shadow-black/20
            `
            : `
              border-white
              bg-white/80
              text-slate-700
              hover:bg-white
              hover:border-cyan-400/40
              shadow-lg shadow-slate-200/50
            `
        }
      `}
    >
      {/* Glow */}
      <div className="absolute -left-10 top-0 h-full w-10 rotate-12 bg-white/10 blur-xl transition-all duration-700 group-hover:left-[120%]" />

      <ArrowLeft
        size={17}
        className="
          relative z-10
          transition-transform duration-300
          group-hover:-translate-x-1
        "
      />

      <span className="relative z-10">
        Voltar
      </span>
    </button>
  );
}