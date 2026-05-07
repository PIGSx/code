import { Link } from "react-router-dom";
import {
  Lock,
  Layers,
  BarChart3,
  Download,
  Ticket,
  ShieldCheck,
  Activity,
  Building2,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

export default function Grid() {
  const { theme } = useTheme();

  const [role, setRole] = useState("comum");
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState("apps");

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "comum";
    setRole(storedRole);
    setHasAdminAccess(storedRole === "admin" || storedRole === "ti");
  }, []);

  const user = localStorage.getItem("user") || "usuário";

  const apps = [
    {
      title: "Rastreador",
      path: "/rastreador",
      desc: "Monitoramento operacional e localização.",
      blocked: !hasAdminAccess,
    },
    {
      title: "Camera",
      path: "/camera",
      desc: "Acesso aos recursos de câmera e visão.",
      blocked: !hasAdminAccess,
    },
    {
      title: "Materiais",
      path: "/materiais",
      desc: "Processamento e gestão de materiais.",
    },
    {
      title: "Pendente",
      path: "/pendente",
      desc: "Consulta e análise de pendências.",
    },
  ];

  const dashboards = [
    {
      title: "IORD",
      path: "/iord",
      desc: "Indicadores e acompanhamento IORD.",
    },
    {
      title: "Polos",
      path: "/polos",
      desc: "Painéis de performance por polos.",
    },
    {
      title: "PTRAC",
      path: "/ptrac",
      desc: "Dashboard de controle PTRAC.",
    },
    {
      title: "Carteira",
      path: "/carteira",
      desc: "Visão analítica da carteira operacional.",
    },
  ];

  const selectedList = activeCategory === "apps" ? apps : dashboards;

  const isDark = theme === "dark";

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-[#070b16] text-white"
          : "bg-slate-100 text-slate-950"
      }`}
    >
      <div className="relative overflow-hidden px-6 py-8 lg:px-12">
        {/* BACKGROUND DECORATIVO */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
          <div className="absolute top-40 -right-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          {/* HERO */}
          <section
            className={`mb-8 rounded-[2rem] border p-8 shadow-2xl lg:p-10 ${
              isDark
                ? "border-white/10 bg-white/[0.04]"
                : "border-white bg-white"
            }`}
          >
            <div className="grid gap-8 lg:grid-cols-[1.5fr_.9fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-300">
                  <ShieldCheck className="h-4 w-4" />
                  Plataforma corporativa
                </div>

                <h1 className="max-w-3xl text-4xl font-black tracking-tight lg:text-5xl">
                  Bem-vindo,{" "}
                  <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {user}
                  </span>
                </h1>

                <p
                  className={`mt-4 max-w-2xl text-base leading-relaxed lg:text-lg ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  Central operacional para acessar aplicações, dashboards,
                  downloads e chamados em um único ambiente seguro.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-400">
                    ● Sistema operacional
                  </span>
                  <span className="rounded-full bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-400">
                    Empresa ativa: Technoblade
                  </span>
                  <span className="rounded-full bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-400">
                    Perfil: {role}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <InfoCard icon={Activity} label="Status" value="Online" />
                <InfoCard icon={Layers} label="Aplicativos" value={apps.length} />
                <InfoCard
                  icon={BarChart3}
                  label="Dashboards"
                  value={dashboards.length}
                />
              </div>
            </div>
          </section>

          {/* ATALHOS PRINCIPAIS */}
          <section className="mb-8 grid gap-5 md:grid-cols-4">
            <MainShortcut
              active={activeCategory === "apps"}
              icon={Layers}
              title="Aplicativos"
              desc="Sistemas operacionais"
              onClick={() => setActiveCategory("apps")}
            />

            <MainShortcut
              active={activeCategory === "dash"}
              icon={BarChart3}
              title="Dashboards"
              desc="Painéis de acompanhamento"
              onClick={() => setActiveCategory("dash")}
            />

            <Link to="/downloads">
              <MainShortcut
                icon={Download}
                title="Downloads"
                desc="Arquivos disponíveis"
              />
            </Link>

            <Link to="/chamados">
              <MainShortcut
                icon={Ticket}
                title="Chamados"
                desc="Suporte de T.I"
              />
            </Link>
          </section>

          {/* CONTEÚDO */}
          <section className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">
                    {activeCategory === "apps"
                      ? "Aplicações disponíveis"
                      : "Dashboards disponíveis"}
                  </h2>
                  <p
                    className={`mt-1 text-sm ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Selecione uma opção para acessar o módulo desejado.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
                >
                  {selectedList.map((item) => (
                    <ModuleCard key={item.title} item={item} />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* LATERAL */}
            <aside className="space-y-5">
              <Panel title="Ambiente">
                <div className="space-y-3 text-sm">
                  <StatusLine label="API" value="Operacional" />
                  <StatusLine label="Banco de dados" value="Conectado" />
                  <StatusLine label="Autenticação" value="Ativa" />
                </div>
              </Panel>

              <Panel title="Atividades recentes">
                <div className="space-y-4 text-sm">
                  <ActivityLine text="Login realizado com sucesso" />
                  <ActivityLine text="Dashboard atualizado" />
                  <ActivityLine text="Módulos carregados" />
                  <ActivityLine text="Permissões verificadas" />
                </div>
              </Panel>
            </aside>
          </section>
        </div>
      </div>
    </main>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <Icon className="mb-3 h-5 w-5 text-cyan-400" />
      <p className="text-xs uppercase tracking-widest text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-black">{value}</p>
    </div>
  );
}

function MainShortcut({ icon: Icon, title, desc, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group w-full rounded-3xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        active
          ? "border-violet-400/50 bg-violet-500/20"
          : "border-white/10 bg-white/[0.05] hover:bg-white/[0.08]"
      }`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-lg">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-black">{title}</h3>
      <p className="mt-1 text-sm text-slate-400">{desc}</p>
    </button>
  );
}

function ModuleCard({ item }) {
  if (item.blocked) {
    return (
      <div className="relative min-h-44 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 opacity-60">
        <h3 className="text-2xl font-black">{item.title}</h3>
        <p className="mt-2 text-sm text-slate-400">{item.desc}</p>

        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white">
            <Lock className="h-4 w-4" />
            Apenas administradores
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className="group relative min-h-44 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-white/[0.08]"
    >
      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl transition-all duration-700 group-hover:scale-[2.5]" />

      <div className="relative">
        <h3 className="text-2xl font-black">{item.title}</h3>
        <p className="mt-3 min-h-10 text-sm leading-relaxed text-slate-400">
          {item.desc}
        </p>

        <div className="mt-8 flex items-center justify-between">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            Disponível
          </span>

          <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-cyan-400" />
        </div>
      </div>
    </Link>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 shadow-xl">
      <h3 className="mb-5 text-lg font-black">{title}</h3>
      {children}
    </div>
  );
}

function StatusLine({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white/[0.04] px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-emerald-400">● {value}</span>
    </div>
  );
}

function ActivityLine({ text }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
      <p className="text-slate-400">{text}</p>
    </div>
  );
}