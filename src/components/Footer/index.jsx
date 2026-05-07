import React from "react";
import { useLocation } from "react-router-dom";
import {
  ShieldCheck,
  Activity,
  Layers3,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();
  const location = useLocation();

  // ESCONDE NO LOGIN
  if (location.pathname === "/login") return null;

  const isDark = theme === "dark";

  return (
    <footer
      className={`
        relative overflow-hidden border-t transition-colors duration-300
        ${
          isDark
            ? "border-white/10 bg-[#050816] text-slate-200"
            : "border-slate-200 bg-slate-100 text-slate-800"
        }
      `}
    >
      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Glow esquerdo */}
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />

        {/* Glow direito */}
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        {/* Grid */}
        <div
          className={`
            absolute inset-0 opacity-[0.03]
            ${
              isDark
                ? "bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]"
                : "bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)]"
            }
            bg-[size:48px_48px]
          `}
        />

        {/* Texto gigante */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className={`
              select-none whitespace-nowrap font-black tracking-tight
              text-[22vw] opacity-[0.04]
              ${isDark ? "text-violet-400" : "text-violet-700"}
            `}
          >
            TECHNOBLADE
          </span>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* ESQUERDA */}
          <div>
            <div className="mb-5 flex items-center gap-3">
              <div
                className="
                  flex h-11 w-11 items-center justify-center rounded-2xl
                  bg-gradient-to-br from-violet-600 to-cyan-400
                  text-white shadow-lg shadow-violet-500/20
                "
              >
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-2xl font-black tracking-tight">
                  TECHNOBLADE
                </h2>

                <p
                  className={`text-xs font-semibold uppercase tracking-[0.25em]
                  ${isDark ? "text-slate-500" : "text-slate-500"}
                `}
                >
                  Enterprise Operational Platform
                </p>
              </div>
            </div>

            <p
              className={`
                max-w-2xl text-sm leading-7
                ${isDark ? "text-slate-400" : "text-slate-600"}
              `}
            >
              Plataforma corporativa desenvolvida para centralizar aplicações,
              dashboards, automações e operações empresariais em um único
              ambiente moderno, seguro e inteligente.
            </p>

            {/* STATUS */}
            <div className="mt-8 flex flex-wrap gap-3">
              <StatusBadge
                icon={Activity}
                text="Sistema operacional"
              />

              <StatusBadge
                icon={Layers3}
                text="Aplicações integradas"
              />

              <StatusBadge
                icon={BarChart3}
                text="Dashboards ativos"
              />
            </div>
          </div>

          {/* DIREITA */}
          <div className="grid grid-cols-2 gap-4">
            <InfoCard
              title="Segurança"
              desc="Controle de acesso e autenticação segura."
            />

            <InfoCard
              title="Performance"
              desc="Interface moderna e otimizada."
            />

            <InfoCard
              title="Escalabilidade"
              desc="Preparado para múltiplas empresas."
            />

            <InfoCard
              title="Operações"
              desc="Centralização operacional inteligente."
            />
          </div>
        </div>

        {/* RODAPÉ INFERIOR */}
        <div
          className={`
            mt-14 flex flex-col gap-4 border-t pt-6
            md:flex-row md:items-center md:justify-between
            ${
              isDark
                ? "border-white/10"
                : "border-slate-300"
            }
          `}
        >
          <p
            className={`
              text-sm font-medium tracking-wide
              ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-600"
              }
            `}
          >
            © {currentYear} Technoblade Inc. Todos os direitos reservados.
          </p>

          <div
            className={`
              flex items-center gap-2 text-sm
              ${
                isDark
                  ? "text-emerald-400"
                  : "text-emerald-600"
              }
            `}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Plataforma operacional online
          </div>
        </div>
      </div>
    </footer>
  );
};

function StatusBadge({ icon: Icon, text }) {
  return (
    <div
      className="
        flex items-center gap-2 rounded-full
        border border-white/10
        bg-white/[0.04]
        px-4 py-2
        text-sm font-semibold
        backdrop-blur-xl
      "
    >
      <Icon className="h-4 w-4 text-cyan-400" />
      <span>{text}</span>
    </div>
  );
}

function InfoCard({ title, desc }) {
  return (
    <div
      className="
        rounded-3xl border border-white/10
        bg-white/[0.04]
        p-5
        backdrop-blur-xl
        transition-all duration-300
        hover:bg-white/[0.06]
      "
    >
      <h3 className="text-sm font-black uppercase tracking-wide">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {desc}
      </p>
    </div>
  );
}

export default Footer;