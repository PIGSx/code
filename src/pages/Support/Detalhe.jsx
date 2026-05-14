import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  Send,
  Ticket,
  User,
  Wrench,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import api from "../../utils/apiAxios";

export default function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { fetchCount } = useNotifications();

  const isDark = theme === "dark";

  const [chamado, setChamado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const fetchChamado = async () => {
    try {
      const res = await api.get(`/chamados/${id}`);
      setChamado(res.data);
    } catch {
      setError("Erro ao carregar chamado.");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLido = async () => {
    try {
      await api.post(`/chamados/${id}/read`);
      fetchCount();
    } catch {
      console.warn("Falha ao marcar chamado como lido");
    }
  };

  useEffect(() => {
    fetchChamado();
    marcarComoLido();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    try {
      setEnviando(true);

      await api.post(`/chamados/${id}/mensagens`, {
        texto: mensagem,
      });

      setMensagem("");
      await fetchChamado();
      fetchCount();
    } catch {
      alert("Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  if (loading) {
    return (
      <StateScreen
        isDark={isDark}
        icon={Loader2}
        title="Carregando chamado..."
        desc="Buscando detalhes da solicitação."
        spin
      />
    );
  }

  if (error || !chamado) {
    return (
      <StateScreen
        isDark={isDark}
        icon={AlertCircle}
        title="Chamado não encontrado"
        desc={error || "Não foi possível localizar essa solicitação."}
        danger
      />
    );
  }

  const mensagens = chamado.mensagens || [];
  const fechado = chamado.status === "Fechado";

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
            TICKET
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
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className={`
                  mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-black transition
                  ${
                    isDark
                      ? "border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }
                `}
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </button>

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
                Chamado #{chamado.id || id}
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">
                {chamado.titulo}
              </h1>

              <p
                className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {chamado.categoria || "Sem categoria"} • Criado em{" "}
                {formatDate(chamado.criado_em || chamado.data)}
              </p>
            </div>

            <StatusBadge status={chamado.status} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Conversa */}
          <div className="space-y-6">
            <Card isDark={isDark}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
                  <MessageSquare className="h-6 w-6" />
                </div>

                <div>
                  <h2 className="text-xl font-black">Conversa</h2>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Histórico de mensagens do chamado.
                  </p>
                </div>
              </div>

              <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
                {mensagens.length === 0 ? (
                  <div
                    className={`
                      rounded-3xl border p-8 text-center
                      ${
                        isDark
                          ? "border-white/10 bg-white/[0.04] text-slate-400"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }
                    `}
                  >
                    Nenhuma mensagem ainda.
                  </div>
                ) : (
                  mensagens.map((m, i) => (
                    <MensagemBubble
                      key={i}
                      mensagem={m}
                      isDark={isDark}
                    />
                  ))
                )}
              </div>
            </Card>

            {!fechado ? (
              <Card isDark={isDark}>
                <div className="mb-3">
                  <h3 className="text-lg font-black">Nova mensagem</h3>
                  <p
                    className={`text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Pressione Enter para enviar ou Shift + Enter para quebrar
                    linha.
                  </p>
                </div>

                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  placeholder="Digite sua mensagem..."
                  className={`
                    w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition
                    ${
                      isDark
                        ? "border-white/10 bg-white/[0.06] text-white placeholder-slate-500 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-400/10"
                        : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-cyan-500/40 focus:ring-4 focus:ring-cyan-500/10"
                    }
                  `}
                />

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={enviarMensagem}
                    disabled={enviando || !mensagem.trim()}
                    className="
                      inline-flex items-center justify-center gap-2 rounded-2xl
                      bg-gradient-to-r from-violet-600 to-cyan-500
                      px-6 py-3 text-sm font-black text-white
                      shadow-lg shadow-cyan-500/20
                      transition hover:scale-[1.02]
                      disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100
                    "
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </Card>
            ) : (
              <Card isDark={isDark}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-black">Chamado fechado</h3>
                    <p
                      className={`text-sm ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      Este chamado foi finalizado e não aceita novas mensagens.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Lateral */}
          <aside className="space-y-5">
            <Card isDark={isDark}>
              <h3 className="mb-4 text-lg font-black">Detalhes</h3>

              <div className="space-y-3">
                <InfoLine label="Status" value={chamado.status || "Sem status"} />
                <InfoLine
                  label="Categoria"
                  value={chamado.categoria || "Sem categoria"}
                />
                <InfoLine
                  label="Criado em"
                  value={formatDate(chamado.criado_em || chamado.data)}
                />
                <InfoLine
                  label="Mensagens"
                  value={mensagens.length}
                />
              </div>
            </Card>

            <Card isDark={isDark}>
              <h3 className="mb-4 text-lg font-black">Descrição</h3>

              <p
                className={`text-sm leading-7 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {chamado.descricao || "Sem descrição informada."}
              </p>
            </Card>

            <Card isDark={isDark}>
              <h3 className="mb-4 text-lg font-black">Atendimento</h3>

              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                  <Wrench className="h-5 w-5" />
                </div>

                <p
                  className={`text-sm leading-6 ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  A equipe responsável acompanhará as mensagens registradas
                  neste chamado.
                </p>
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </main>
  );
}

function MensagemBubble({ mensagem, isDark }) {
  const isStaff = mensagem.role === "admin" || mensagem.role === "ti";

  return (
    <div
      className={`flex gap-3 ${
        isStaff ? "justify-start" : "justify-end"
      }`}
    >
      {isStaff && <Avatar name={mensagem.autor} staff />}

      <div
        className={`
          max-w-[85%] rounded-3xl px-4 py-3 text-sm shadow-sm
          ${
            isStaff
              ? isDark
                ? "bg-violet-500/15 text-violet-100 border border-violet-400/10"
                : "bg-violet-50 text-violet-900 border border-violet-100"
              : isDark
              ? "bg-white/[0.07] text-slate-100 border border-white/10"
              : "bg-white text-slate-800 border border-slate-200"
          }
        `}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-black">{mensagem.autor || "Usuário"}</span>
          <span className="text-xs opacity-60">
            {formatDate(mensagem.data)}
          </span>
        </div>

        <p className="whitespace-pre-wrap leading-6">
          {mensagem.texto}
        </p>
      </div>

      {!isStaff && <Avatar name={mensagem.autor} />}
    </div>
  );
}

function Avatar({ name, staff }) {
  const initial = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <div
      className={`
        flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-black text-white
        ${
          staff
            ? "bg-gradient-to-br from-violet-600 to-fuchsia-500"
            : "bg-gradient-to-br from-cyan-500 to-blue-500"
        }
      `}
    >
      {initial}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Aberto: {
      icon: AlertCircle,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    "Em andamento": {
      icon: Clock,
      className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    },
    Fechado: {
      icon: CheckCircle2,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
  };

  const current = styles[status] || {
    icon: Ticket,
    className: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  const Icon = current.icon;

  return (
    <span
      className={`
        inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-black
        ${current.className}
      `}
    >
      <Icon className="h-4 w-4" />
      {status || "Sem status"}
    </span>
  );
}

function Card({ children, isDark }) {
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
      {children}
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-black">{value}</span>
    </div>
  );
}

function StateScreen({ icon: Icon, title, desc, isDark, danger, spin }) {
  return (
    <main
      className={`
        flex min-h-screen items-center justify-center px-4
        ${
          isDark
            ? "bg-[#070b16] text-white"
            : "bg-slate-100 text-slate-950"
        }
      `}
    >
      <div
        className={`
          w-full max-w-md rounded-[2rem] border p-8 text-center shadow-xl
          ${
            isDark
              ? "border-white/10 bg-white/[0.04]"
              : "border-white bg-white"
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

        <h2 className="text-xl font-black">{title}</h2>
        <p
          className={`mt-2 text-sm ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
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