import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Headphones,
  Loader2,
  Send,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function AbrirChamado() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categorias = ["Sistema", "Acesso", "Equipamento", "Outro"];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.titulo || !form.categoria || !form.descricao) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/chamados", {
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        descricao: form.descricao.trim(),
      });

      navigate("/meus-chamados");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erro ao abrir chamado."
      );
    } finally {
      setLoading(false);
    }
  };

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
            SUPORTE
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
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
                <Headphones className="h-4 w-4" />
                Central de suporte
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Abrir chamado
              </h1>

              <p
                className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Descreva o problema encontrado para que a equipe responsável
                possa analisar e acompanhar sua solicitação.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/chamados")}
              className={`
                inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black transition
                ${
                  isDark
                    ? "border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }
              `}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className={`
              rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl sm:p-8
              ${
                isDark
                  ? "border-white/10 bg-white/[0.04]"
                  : "border-white bg-white/80"
              }
            `}
          >
            <div className="mb-7 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
                <Ticket className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-black">Dados do chamado</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Preencha as informações abaixo.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <Field label="Título do problema">
                <input
                  type="text"
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ex: Não consigo acessar o sistema"
                  className={inputClass(isDark)}
                />
              </Field>

              <Field label="Categoria">
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={handleChange}
                  className={inputClass(isDark)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Descrição">
                <textarea
                  name="descricao"
                  value={form.descricao}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Descreva o problema com detalhes..."
                  className={`${inputClass(isDark)} resize-none`}
                />
              </Field>
            </div>

            {error && (
              <div
                className="
                  mt-5 flex items-center gap-2 rounded-2xl
                  border border-red-500/20 bg-red-500/10
                  px-4 py-3 text-sm font-semibold text-red-300
                "
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/chamados")}
                className={`
                  rounded-2xl border px-5 py-3 text-sm font-black transition
                  ${
                    isDark
                      ? "border-white/10 text-slate-300 hover:bg-white/[0.06]"
                      : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  }
                `}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex items-center justify-center gap-2 rounded-2xl
                  bg-gradient-to-r from-violet-600 to-cyan-500
                  px-6 py-3 text-sm font-black text-white
                  shadow-lg shadow-cyan-500/20
                  transition hover:scale-[1.02]
                  disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Abrir chamado
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Painel lateral */}
          <aside className="space-y-5">
            <Panel title="Orientações" isDark={isDark}>
              <ul className="space-y-3 text-sm leading-6">
                <li>Descreva o erro com o máximo de detalhes possível.</li>
                <li>Informe em qual sistema ou página o problema ocorreu.</li>
                <li>Inclua mensagens de erro, se houver.</li>
                <li>Evite abrir chamados duplicados para o mesmo problema.</li>
              </ul>
            </Panel>

            <Panel title="Prioridade" isDark={isDark}>
              <div className="space-y-3 text-sm">
                <Priority label="Sistema" desc="Falhas em aplicações." />
                <Priority label="Acesso" desc="Login, permissões ou bloqueios." />
                <Priority label="Equipamento" desc="Máquina, periféricos ou rede." />
              </div>
            </Panel>

            <Panel title="Ambiente seguro" isDark={isDark}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>

                <p
                  className={`text-sm leading-6 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Sua solicitação será registrada e acompanhada pela equipe
                  responsável.
                </p>
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-slate-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function inputClass(isDark) {
  return `
    w-full rounded-2xl border px-4 py-3 text-sm outline-none transition
    ${
      isDark
        ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
        : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
    }
  `;
}

function Panel({ title, children, isDark }) {
  return (
    <div
      className={`
        rounded-[2rem] border p-6 shadow-xl backdrop-blur-2xl
        ${
          isDark
            ? "border-white/10 bg-white/[0.04]"
            : "border-white bg-white/80"
        }
      `}
    >
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className={isDark ? "text-slate-400" : "text-slate-600"}>
        {children}
      </div>
    </div>
  );
}

function Priority({ label, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="font-black">{label}</p>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </div>
  );
}