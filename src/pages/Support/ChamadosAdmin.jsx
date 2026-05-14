import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Plus,
  Search,
  Ticket,
  Wrench,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function MeusChamados() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await api.get("/chamados");
        setChamados(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Erro ao carregar chamados."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, []);

  const filteredChamados = useMemo(() => {
    return chamados.filter((chamado) => {
      const value = `
        ${chamado.titulo || ""}
        ${chamado.categoria || ""}
        ${chamado.status || ""}
        ${chamado.ultimaMensagem || ""}
      `.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [chamados, search]);

  const totalAbertos = chamados.filter((c) => c.status === "Aberto").length;
  const totalAndamento = chamados.filter(
    (c) => c.status === "Em andamento"
  ).length;
  const totalFechados = chamados.filter((c) => c.status === "Fechado").length;

  return (
    <main
      className={`
        relative min-h-screen overflow-hidden px-4 py-8 transition-colors duration-300 sm:px-6 lg:px-10
        ${
          isDark
            ? "bg-[#070b16] text-white"
            : "bg-slate-100 text-slate-950"
        }
      `}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div
          className={`
            absolute inset-0 opacity-[0.04]
            ${
              isDark
                ? "bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]"
                : "bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)]"
            }
            bg-[size:56px_56px]
          `}
        />

        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span
            className={`
              select-none whitespace-nowrap text-[20vw] font-black tracking-tight opacity-[0.035]
              ${isDark ? "text-white" : "text-slate-900"}
            `}
          >
            CHAMADOS
          </span>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Hero */}
        <section
          className={`
            mb-8 rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl sm:p-8
            ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white bg-white/80"
            }
          `}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div
                className={`
                  mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold
                  ${
                    isDark
                      ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                      : "border-violet-500/20 bg-violet-500/10 text-violet-700"
                  }
                `}
              >
                <Ticket className="h-4 w-4" />
                Central de suporte
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Meus chamados
              </h1>

              <p
                className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Acompanhe solicitações abertas, atendimentos em andamento e
                chamados finalizados pela equipe de suporte.
              </p>
            </div>

            <button
              onClick={() => navigate("/chamados/novo")}
              className="
                inline-flex items-center justify-center gap-2 rounded-2xl
                bg-gradient-to-r from-violet-600 to-cyan-500
                px-5 py-3 text-sm font-black text-white
                shadow-lg shadow-cyan-500/20
                transition hover:scale-[1.02]
              "
            >
              <Plus className="h-5 w-5" />
              Abrir chamado
            </button>
          </div>
        </section>

        {/* KPIs */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <KpiCard
            icon={Ticket}
            label="Total"
            value={chamados.length}
            isDark={isDark}
          />
          <KpiCard
            icon={AlertCircle}
            label="Abertos"
            value={totalAbertos}
            isDark={isDark}
          />
          <KpiCard
            icon={Wrench}
            label="Em andamento"
            value={totalAndamento}
            isDark={isDark}
          />
          <KpiCard
            icon={CheckCircle2}
            label="Fechados"
            value={totalFechados}
            isDark={isDark}
          />
        </section>

        {/* Toolbar */}
        <section
          className={`
            mb-6 flex flex-col gap-4 rounded-3xl border p-4 backdrop-blur-2xl md:flex-row md:items-center md:justify-between
            ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white bg-white/80"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">Lista de chamados</h2>
              <p
                className={
                  isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"
                }
              >
                {filteredChamados.length} resultado(s) encontrado(s)
              </p>
            </div>
          </div>

          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Buscar chamado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`
                w-full rounded-2xl border px-12 py-3 text-sm outline-none transition
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                    : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
                }
              `}
            />
          </div>
        </section>

        {/* Estados */}
        {loading && (
          <StateCard
            icon={Loader2}
            title="Carregando chamados..."
            desc="Buscando suas solicitações registradas."
            isDark={isDark}
            spin
          />
        )}

        {!loading && error && (
          <StateCard
            icon={AlertCircle}
            title="Erro ao carregar chamados"
            desc={error}
            isDark={isDark}
            danger
          />
        )}

        {!loading && !error && chamados.length === 0 && (
          <StateCard
            icon={Ticket}
            title="Nenhum chamado encontrado"
            desc="Você ainda não possui chamados registrados."
            isDark={isDark}
          />
        )}

        {!loading && !error && chamados.length > 0 && filteredChamados.length === 0 && (
          <StateCard
            icon={Search}
            title="Nenhum resultado encontrado"
            desc="Tente buscar por outro título, categoria ou status."
            isDark={isDark}
          />
        )}

        {/* Lista */}
        {!loading && !error && filteredChamados.length > 0 && (
          <section className="grid gap-4">
            {filteredChamados.map((chamado) => (
              <ChamadoCard
                key={chamado.id}
                chamado={chamado}
                isDark={isDark}
                onClick={() => navigate(`/chamados/${chamado.id}`)}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function ChamadoCard({ chamado, isDark, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        group w-full rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-all duration-300
        hover:-translate-y-0.5
        ${
          isDark
            ? "border-white/10 bg-white/[0.04] hover:bg-white/[0.07] hover:border-cyan-400/30"
            : "border-white bg-white/80 hover:bg-white hover:border-cyan-400/40"
        }
      `}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`
                rounded-full px-3 py-1 text-xs font-black uppercase
                ${
                  isDark
                    ? "bg-white/10 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {chamado.categoria || "Sem categoria"}
            </span>

            <StatusBadge status={chamado.status} />
          </div>

          <h3 className="truncate text-lg font-black">
            {chamado.titulo}
          </h3>

          <p
            className={`mt-2 text-sm ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {chamado.data
              ? new Date(chamado.data).toLocaleString("pt-BR")
              : "Sem data"}
          </p>

          {chamado.ultimaMensagem && (
            <p
              className={`mt-2 line-clamp-1 text-sm ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              {chamado.ultimaMensagem}
            </p>
          )}
        </div>

        <div
          className={`
            flex items-center gap-2 text-sm font-bold
            ${isDark ? "text-cyan-300" : "text-cyan-700"}
          `}
        >
          Ver detalhes
          <span className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Aberto: "bg-blue-500/10 text-blue-400",
    "Em andamento": "bg-yellow-500/10 text-yellow-400",
    Fechado: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`
        rounded-full px-3 py-1 text-xs font-black
        ${styles[status] || "bg-slate-500/10 text-slate-400"}
      `}
    >
      {status || "Sem status"}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, isDark }) {
  return (
    <div
      className={`
        rounded-3xl border p-5 shadow-sm backdrop-blur-2xl
        ${
          isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-white bg-white/80"
        }
      `}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-3xl font-black">{value}</p>
    </div>
  );
}

function StateCard({ icon: Icon, title, desc, isDark, danger, spin }) {
  return (
    <div
      className={`
        rounded-3xl border p-10 text-center shadow-sm backdrop-blur-2xl
        ${
          isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-white bg-white/80"
        }
      `}
    >
      <div
        className={`
          mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl
          ${
            danger
              ? "bg-red-500/10 text-red-400"
              : "bg-gradient-to-br from-violet-600 to-cyan-400 text-white"
          }
        `}
      >
        <Icon className={`h-6 w-6 ${spin ? "animate-spin" : ""}`} />
      </div>

      <h3 className="text-xl font-black">{title}</h3>
      <p
        className={`mt-2 text-sm ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {desc}
      </p>
    </div>
  );
}