// src/pages/Chamados/MeusChamados.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

export default function MeusChamados() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");

  const fetchChamados = async () => {
    try {
      const res = await api.get("/meus-chamados");
      setChamados(res.data || []);
    } catch {
      setError("Erro ao carregar seus chamados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      const value = `${c.titulo || ""} ${c.categoria || ""} ${
        c.status || ""
      } ${c.descricao || ""}`.toLowerCase();

      return value.includes(search.toLowerCase());
    });
  }, [chamados, search]);

  const totalAbertos = chamados.filter((c) => c.status === "Aberto").length;
  const totalAndamento = chamados.filter((c) => c.status === "Em andamento").length;
  const totalFechados = chamados.filter((c) => c.status === "Fechado").length;

  if (loading) {
    return (
      <StateScreen
        isDark={isDark}
        icon={Loader2}
        title="Carregando chamados..."
        desc="Buscando suas solicitações registradas."
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
              Acompanhe suas solicitações, respostas da equipe e o andamento dos
              atendimentos abertos.
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
          className={`mb-6 flex flex-col gap-4 rounded-3xl border p-4 backdrop-blur-2xl md:flex-row md:items-center md:justify-between ${
            isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
              <MessageSquare className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-lg font-black">Solicitações</h2>
              <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
                {chamadosFiltrados.length} resultado(s) encontrado(s)
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
              className={`w-full rounded-2xl border px-12 py-3 text-sm outline-none transition ${
                isDark
                  ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                  : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
              }`}
            />
          </div>
        </section>

        {chamados.length === 0 ? (
          <StateCard
            isDark={isDark}
            icon={Ticket}
            title="Nenhum chamado encontrado"
            desc="Você ainda não abriu nenhum chamado."
          />
        ) : chamadosFiltrados.length === 0 ? (
          <StateCard
            isDark={isDark}
            icon={Search}
            title="Nenhum resultado encontrado"
            desc="Tente buscar por outro título, categoria ou status."
          />
        ) : (
          <section className="grid gap-4">
            {chamadosFiltrados.map((c) => {
              const naoLido = c.nao_lido_por?.includes(username);

              return (
                <ChamadoCard
                  key={c.id}
                  chamado={c}
                  isDark={isDark}
                  naoLido={naoLido}
                />
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function ChamadoCard({ chamado, isDark, naoLido }) {
  return (
    <Link
      to={`/chamados/${chamado.id}`}
      className={`group relative block rounded-3xl border p-5 shadow-sm backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 ${
        naoLido
          ? isDark
            ? "border-violet-400/40 bg-violet-500/10"
            : "border-violet-300 bg-violet-50"
          : isDark
          ? "border-white/10 bg-white/[0.04] hover:border-cyan-400/30 hover:bg-white/[0.07]"
          : "border-white bg-white/80 hover:border-cyan-400/40 hover:bg-white"
      }`}
    >
      {naoLido && (
        <span className="absolute right-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white shadow-lg shadow-red-500/20">
          Nova resposta
        </span>
      )}

      <div className="flex flex-col gap-4 pr-0 sm:pr-32 md:flex-row md:items-center md:justify-between">
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
            {formatDate(chamado.criado_em)}
          </p>

          <p className={`mt-3 line-clamp-2 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {chamado.descricao || "Sem descrição informada."}
          </p>
        </div>

        <div className={`flex items-center gap-2 text-sm font-bold ${isDark ? "text-cyan-300" : "text-cyan-700"}`}>
          Ver chamado
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
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
          CHAMADOS
        </span>
      </div>
    </div>
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