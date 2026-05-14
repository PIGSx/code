import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Search,
  Ticket,
  Wrench,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function ListaChamados() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const chamadosFiltrados = useMemo(() => {
    return chamados
      .filter((c) => (statusFiltro === "Todos" ? true : c.status === statusFiltro))
      .filter((c) => {
        const value = `${c.titulo || ""} ${c.categoria || ""} ${c.autor || ""} ${
          c.status || ""
        }`.toLowerCase();

        return value.includes(search.toLowerCase());
      })
      .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
  }, [chamados, statusFiltro, search]);

  const totalAbertos = chamados.filter((c) => c.status === "Aberto").length;
  const totalAndamento = chamados.filter((c) => c.status === "Em andamento").length;
  const totalFechados = chamados.filter((c) => c.status === "Fechado").length;

  if (loading) {
    return (
      <StateScreen
        isDark={isDark}
        icon={Loader2}
        title="Carregando chamados..."
        desc="Buscando solicitações registradas."
        spin
      />
    );
  }

  if (error) {
    return (
      <StateScreen
        isDark={isDark}
        icon={AlertCircle}
        title="Erro ao carregar chamados"
        desc={error}
        danger
      />
    );
  }

  return (
    <main
      className={`relative min-h-screen overflow-hidden px-4 py-8 transition-colors duration-300 sm:px-6 lg:px-10 ${
        isDark ? "bg-[#070b16] text-white" : "bg-slate-100 text-slate-950"
      }`}
    >
      <Background isDark={isDark} />

      <div className="relative z-10 mx-auto max-w-7xl">
        <section
          className={`mb-8 rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl sm:p-8 ${
            isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
          }`}
        >
          <div>
            <div
              className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
                isDark
                  ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                  : "border-violet-500/20 bg-violet-500/10 text-violet-700"
              }`}
            >
              <Ticket className="h-4 w-4" />
              Painel administrativo
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Central de chamados
            </h1>

            <p
              className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Gerencie solicitações abertas, acompanhe atendimentos e monitore
              tickets da plataforma.
            </p>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <KpiCard icon={Ticket} label="Total" value={chamados.length} isDark={isDark} />
          <KpiCard icon={AlertCircle} label="Abertos" value={totalAbertos} isDark={isDark} />
          <KpiCard
            icon={Wrench}
            label="Em andamento"
            value={totalAndamento}
            isDark={isDark}
          />
          <KpiCard icon={CheckCircle2} label="Fechados" value={totalFechados} isDark={isDark} />
        </section>

        <section
          className={`mb-6 flex flex-col gap-4 rounded-3xl border p-4 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between ${
            isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
          }`}
        >
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

            <input
              type="text"
              placeholder="Buscar chamado..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full rounded-2xl border px-12 py-3 text-sm outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
              }`}
            />
          </div>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition ${
              isDark
                ? "border-white/10 bg-[#111827] text-white"
                : "border-slate-200 bg-white text-slate-900"
            }`}
          >
            <option>Todos</option>
            <option>Aberto</option>
            <option>Respondido</option>
            <option>Em andamento</option>
            <option>Fechado</option>
          </select>
        </section>

        {chamadosFiltrados.length === 0 ? (
          <StateCard
            isDark={isDark}
            icon={Ticket}
            title="Nenhum chamado encontrado"
            desc="Não há chamados correspondentes ao filtro atual."
          />
        ) : (
          <section className="grid gap-4">
            {chamadosFiltrados.map((chamado) => (
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

function Background({ isDark }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div
        className={`absolute inset-0 bg-[size:56px_56px] opacity-[0.04] ${
          isDark
            ? "bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)]"
            : "bg-[linear-gradient(to_right,black_1px,transparent_1px),linear-gradient(to_bottom,black_1px,transparent_1px)]"
        }`}
      />

      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span
          className={`select-none whitespace-nowrap text-[20vw] font-black tracking-tight opacity-[0.035] ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          SUPORTE
        </span>
      </div>
    </div>
  );
}

function ChamadoCard({ chamado, isDark, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-3xl border p-5 text-left shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 ${
        isDark
          ? "border-white/10 bg-white/[0.04] hover:border-cyan-400/30 hover:bg-white/[0.07]"
          : "border-white bg-white/80 hover:border-cyan-400/40 hover:bg-white"
      }`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase ${
                isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
              }`}
            >
              {chamado.categoria || "Sem categoria"}
            </span>

            <StatusBadge status={chamado.status} />
          </div>

          <h3 className="truncate text-lg font-black">{chamado.titulo}</h3>

          <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {chamado.autor || "Sem autor"}
          </p>

          <div
            className={`mt-3 flex flex-wrap items-center gap-4 text-xs ${
              isDark ? "text-slate-500" : "text-slate-500"
            }`}
          >
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(chamado.criado_em)}
            </span>

            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {chamado.mensagens?.length || 0} mensagens
            </span>
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-sm font-bold ${
            isDark ? "text-cyan-300" : "text-cyan-700"
          }`}
        >
          Ver chamado
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Aberto: "bg-blue-500/10 text-blue-400",
    Respondido: "bg-violet-500/10 text-violet-400",
    "Em andamento": "bg-yellow-500/10 text-yellow-400",
    Fechado: "bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-black ${
        styles[status] || "bg-slate-500/10 text-slate-400"
      }`}
    >
      {status || "Sem status"}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, isDark }) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm backdrop-blur-2xl ${
        isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
      }`}
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

function StateCard({ icon: Icon, title, desc, isDark }) {
  return (
    <div
      className={`rounded-3xl border p-10 text-center shadow-sm backdrop-blur-2xl ${
        isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
      }`}
    >
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-xl font-black">{title}</h3>

      <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
        {desc}
      </p>
    </div>
  );
}

function StateScreen({ icon: Icon, title, desc, isDark, danger, spin }) {
  return (
    <main
      className={`flex min-h-screen items-center justify-center px-4 ${
        isDark ? "bg-[#070b16] text-white" : "bg-slate-100 text-slate-950"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-[2rem] border p-8 text-center shadow-xl ${
          isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white"
        }`}
      >
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
            danger
              ? "bg-red-500/10 text-red-400"
              : "bg-gradient-to-br from-violet-600 to-cyan-400 text-white"
          }`}
        >
          <Icon className={`h-6 w-6 ${spin ? "animate-spin" : ""}`} />
        </div>

        <h2 className="text-xl font-black">{title}</h2>

        <p className={`mt-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          {desc}
        </p>
      </div>
    </main>
  );
}

function formatDate(value) {
  if (!value) return "Sem data";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("pt-BR");
}