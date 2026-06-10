import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Download,
  Ticket,
  Headphones,
  PlayCircle,
  LogOut,
  Shield,
  Square,
  Palette,
} from "lucide-react";
import api from "../../utils/apiAxios";
import ModalAutoinicializacao from "../Modal";
import ThemeToggle from "../ThemeToggle";
import { useNotifications } from "../../context/NotificationContext";

const Navbar = () => {
  const [user, setUser] = useState(localStorage.getItem("username"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role") || "comum");
  const [validating, setValidating] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoinicializacaoAtiva, setAutoinicializacaoAtiva] = useState(false);

  const { count } = useNotifications();

  const navigate = useNavigate();
  const location = useLocation();
  const stopRef = useRef(false);

  if (window.tokenExpirado === undefined) {
    window.tokenExpirado = false;
  }

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          window.tokenExpirado = true;
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    const validar = async () => {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        const res = await api.get("/me");

        if (res.data?.logged_in) {
          setUser(res.data.user);
          setRole(res.data.role || "comum");
          localStorage.setItem("role", res.data.role || "comum");
        } else {
          localStorage.clear();
          setUser(null);
          setRole("comum");
        }
      } catch {
        localStorage.clear();
        setUser(null);
        setRole("comum");
      } finally {
        setValidating(false);
      }
    };

    validar();
  }, [token]);

  const handleLogout = async () => {
    try {
      await api.post("/logout", { token });
    } catch {}

    localStorage.clear();
    setUser(null);
    setToken(null);
    setRole("comum");
    navigate("/login");
  };

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const startAutoinicializacao = async (abas, subCards, tempo, loop) => {
    setAutoinicializacaoAtiva(true);
    stopRef.current = false;

    const navegar = async (aba) => {
      if (stopRef.current) return;

      switch (aba.toLowerCase()) {
        case "materiais":
          navigate("/materiais");
          break;
        case "rastreador":
          navigate("/rastreador");
          break;
        case "ptrac":
          navigate("/ptrac");
          break;
        case "carteira":
          navigate("/carteira");
          break;
        case "polos":
          for (const polo of subCards["Polos"] || []) {
            if (stopRef.current) return;

            if (polo === "955") navigate("/itaim");
            if (polo === "921") navigate("/penha");
            if (polo === "920") navigate("/sm");

            await delay(tempo * 1000);
          }
          return;
        default:
          return;
      }

      await delay(tempo * 1000);
    };

    do {
      for (const aba of abas) {
        if (stopRef.current) break;
        await navegar(aba);
      }
    } while (loop && !stopRef.current);

    setAutoinicializacaoAtiva(false);
  };

  const stopAutoinicializacao = () => {
    stopRef.current = true;
    setAutoinicializacaoAtiva(false);
  };

  const navItems = [
    {
      label: "Downloads",
      path: "/download",
      icon: Download,
    },
    role === "ti"
      ? {
          label: "Chamados",
          path: "/chamados",
          icon: Ticket,
          showBadge: true,
        }
      : {
          label: "Suporte",
          path: "/suporte",
          icon: Headphones,
          showBadge: true,
        },
  ];

  const isActive = (path) => location.pathname === path;

  const getRoleLabel = () => {
    if (role === "ti") return "T.I";
    if (role === "admin") return "Administrador";
    return "Usuário";
  };

  const getInitial = () => {
    if (!user) return "U";
    return user.charAt(0).toUpperCase();
  };

  if (location.pathname === "/login") return null;

  return (
    <>
      <header
        className="
          sticky top-0 z-50
          border-b border-slate-200/70 dark:border-white/10
          bg-white/80 dark:bg-[#070b16]/85
          backdrop-blur-2xl
          shadow-sm dark:shadow-black/30
        "
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 lg:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <div
              className="
                flex h-9 w-9 items-center justify-center rounded-2xl
                bg-gradient-to-br from-violet-600 to-cyan-400
                text-white shadow-lg shadow-violet-500/20
                transition group-hover:scale-105
              "
            >
              <Shield className="h-5 w-5" />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
                TECHNOBLADE
              </h1>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:block">
                Enterprise Portal
              </p>
            </div>
          </Link>

          <ul
            className="
              hidden items-center gap-1 rounded-full
              border border-slate-200 bg-slate-100/80 p-1
              dark:border-white/10 dark:bg-white/[0.04]
              md:flex
            "
          >
            <li>
              <button
                onClick={() => setShowModal(true)}
                className="
                  flex items-center gap-2 rounded-full px-4 py-2
                  text-sm font-bold text-violet-600
                  transition hover:bg-white hover:shadow-sm
                  dark:text-violet-300 dark:hover:bg-white/10
                "
              >
                <PlayCircle className="h-4 w-4" />
                Autoinicialização
              </button>
            </li>

            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 rounded-full px-4 py-2
                      text-sm font-bold transition
                      ${
                        isActive(item.path)
                          ? "bg-white text-slate-950 shadow-sm dark:bg-white/15 dark:text-white"
                          : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}

                    {item.showBadge && count > 0 && (
                      <span
                        className="
                          absolute -right-1 -top-1
                          flex h-5 min-w-5 items-center justify-center rounded-full
                          bg-red-500 px-1 text-xs font-black text-white
                          shadow-lg shadow-red-500/30
                        "
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-4 md:flex">
            {!showModal && <ThemeToggle />}

            {user && (
              <div
                className="
                  flex items-center gap-3 rounded-full
                  border border-slate-200 bg-white px-2.5 py-1.5
                  shadow-sm
                  dark:border-white/10 dark:bg-white/[0.04]
                "
              >
                <div
                  className="
                    flex h-8 w-8 items-center justify-center rounded-full
                    bg-gradient-to-br from-violet-500 to-cyan-400
                    text-sm font-black text-white
                  "
                >
                  {getInitial()}
                </div>

                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {user}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="
                flex items-center gap-2 rounded-full
                bg-red-500 px-4 py-2 text-sm font-black text-white
                shadow-lg shadow-red-500/20
                transition hover:scale-105 hover:bg-red-400
              "
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(true)}
            className="
              z-50 flex h-10 w-10 items-center justify-center rounded-2xl
              border border-slate-200 bg-white text-slate-900
              shadow-sm transition hover:bg-slate-100
              dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10
              md:hidden
            "
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          <div
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <aside
            className="
              absolute right-0 top-0 flex h-full w-[82vw] max-w-[340px] flex-col
              border-l border-white/10 bg-[#070b16] p-5 text-white shadow-2xl
            "
          >
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400">
                  <Shield className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-base font-black bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                    TECHNOBLADE
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Enterprise Portal
                  </p>
                </div>
              </Link>

              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-xl bg-white/10 p-2 transition hover:bg-white/15"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-base font-black">
                    {getInitial()}
                  </div>

                  <div>
                    <p className="font-black">{user}</p>
                    <p className="text-sm text-slate-400">{getRoleLabel()}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.05] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-300">
                <Palette className="h-4 w-4 text-yellow-300" />
                Aparência
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3">
                <span className="text-sm font-semibold text-slate-300">
                  Tema do sistema
                </span>

                <ThemeToggle />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowModal(true);
                }}
                className="
                  flex items-center gap-3 rounded-2xl bg-white/[0.06]
                  px-4 py-3 text-left font-bold transition hover:bg-white/10
                "
              >
                <PlayCircle className="h-5 w-5 text-violet-300" />
                Autoinicialização
              </button>

              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`
                      relative flex items-center gap-3 rounded-2xl
                      px-4 py-3 font-bold transition
                      ${
                        isActive(item.path)
                          ? "bg-white/15 text-white"
                          : "bg-white/[0.06] text-slate-200 hover:bg-white/10"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 text-cyan-300" />
                    {item.label}

                    {item.showBadge && count > 0 && (
                      <span className="ml-auto flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-2 text-xs font-black text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <button
              onClick={handleLogout}
              className="
                mt-auto flex items-center justify-center gap-2 rounded-2xl
                bg-red-500 py-3 font-black text-white
                shadow-lg shadow-red-500/20 transition hover:bg-red-400
              "
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </aside>
        </div>
      )}

      {autoinicializacaoAtiva && (
        <button
          onClick={stopAutoinicializacao}
          className="
            fixed bottom-6 right-6 z-[998]
            flex items-center gap-2 rounded-full
            bg-gradient-to-r from-red-500 to-pink-500
            px-5 py-3 font-black text-white
            shadow-2xl shadow-red-500/30
            transition hover:scale-105
          "
        >
          <Square className="h-4 w-4 fill-white" />
          Parar autoinicialização
        </button>
      )}

      <ModalAutoinicializacao
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={(abas, subCards, tempo, loop) => {
          setShowModal(false);
          startAutoinicializacao(abas, subCards, tempo, loop);
        }}
      />
    </>
  );
};

export default Navbar;