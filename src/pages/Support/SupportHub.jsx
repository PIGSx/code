import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Headset,
  ListChecks,
  MessageSquare,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function SuporteHub() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
              isDark
                ? "border-violet-400/20 bg-violet-400/10 text-violet-300"
                : "border-violet-500/20 bg-violet-500/10 text-violet-700"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Central de suporte
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Suporte Technoblade
          </h1>

          <p
            className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Abra solicitações, acompanhe respostas e consulte o andamento dos
            seus chamados em um único ambiente.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <HubCard
            isDark={isDark}
            icon={Headset}
            title="Abrir chamado"
            desc="Solicite ajuda, registre um problema ou envie uma demanda para atendimento."
            badge="Novo atendimento"
            onClick={() => navigate("/chamados/novo")}
          />

          <HubCard
            isDark={isDark}
            icon={ListChecks}
            title="Meus chamados"
            desc="Acompanhe respostas, histórico de mensagens e status das suas solicitações."
            badge="Acompanhamento"
            onClick={() => navigate("/meus-chamados")}
          />
        </section>

        <section
          className={`mt-6 rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl ${
            isDark ? "border-white/10 bg-white/[0.04]" : "border-white bg-white/80"
          }`}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={Ticket}
              title="Registro centralizado"
              desc="Todos os chamados ficam organizados por status e histórico."
            />

            <InfoCard
              icon={MessageSquare}
              title="Conversa integrada"
              desc="Troque mensagens diretamente dentro do chamado."
            />

            <InfoCard
              icon={ShieldCheck}
              title="Ambiente seguro"
              desc="Solicitações associadas ao seu usuário autenticado."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function HubCard({ icon: Icon, title, desc, badge, onClick, isDark }) {
  return (
    <button
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[2rem] border p-6 text-left shadow-xl backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "border-white/10 bg-white/[0.04] hover:border-cyan-400/30 hover:bg-white/[0.07]"
          : "border-white bg-white/80 hover:border-cyan-400/40 hover:bg-white"
      }`}
    >
      <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-violet-500/10 blur-3xl transition duration-700 group-hover:scale-[2]" />

      <div className="relative">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white shadow-lg shadow-cyan-500/20">
            <Icon className="h-7 w-7" />
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              isDark ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"
            }`}
          >
            {badge}
          </span>
        </div>

        <h2 className="text-2xl font-black">{title}</h2>

        <p
          className={`mt-3 max-w-xl text-sm leading-6 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {desc}
        </p>

        <div
          className={`mt-8 flex items-center gap-2 text-sm font-black ${
            isDark ? "text-cyan-300" : "text-cyan-700"
          }`}
        >
          Acessar
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
}

function InfoCard({ icon: Icon, title, desc }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-cyan-400">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
    </div>
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