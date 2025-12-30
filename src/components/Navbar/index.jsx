import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

  /* =========================
     Interceptor
  ========================= */
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

  /* =========================
     Validação
  ========================= */
  useEffect(() => {
    const validar = async () => {
      if (!token) {
        setValidating(false);
        return;
      }

      try {
        const res = await api.get("/current_user");
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

  /* =========================
     Logout
  ========================= */
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

  /* =========================
     Roles
  ========================= */
  const ROLE_LEVEL = { comum: 1, admin: 2, ti: 3 };
  const hasRole = (min) => ROLE_LEVEL[role] >= ROLE_LEVEL[min];

  /* =========================
     Autoinicialização
  ========================= */
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

  /* =========================
     Menu
  ========================= */
  const navItems = [
    { label: "Downloads", path: "/download" },
    hasRole("admin") || hasRole("ti")
      ? { label: "Chamados", path: "/chamados", showBadge: true }
      : { label: "Suporte", path: "/suporte", showBadge: true },
  ];

  if (location.pathname === "/login") return null;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0b0f1a] border-b dark:border-white/5">
        <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent"
          >
            TECHNOBLADE
          </Link>

          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-6">
            <li>
              <button
                onClick={() => setShowModal(true)}
                className="text-sm font-medium text-purple-600 dark:text-purple-400"
              >
                Autoinicialização
              </button>
            </li>

            {navItems.map((item) => (
              <li key={item.path} className="relative">
                <Link to={item.path}>
                  {item.label}
                  {item.showBadge && count > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop user */}
          <div className="hidden md:flex items-center gap-4">
            {!showModal && <ThemeToggle />}
            {user && (
              <>
                <span className="text-sm">
                  Oi, <b>{user}</b> <span className="opacity-60">({role})</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 rounded-lg bg-red-500 text-white"
                >
                  Sair
                </button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col gap-1.5 z-50"
          >
            <span
              className={`w-6 h-0.5 bg-current transition-all ${
                menuOpen && "rotate-45 translate-y-2"
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-current transition-all ${
                menuOpen && "opacity-0"
              }`}
            />
            <span
              className={`w-6 h-0.5 bg-current transition-all ${
                menuOpen && "-rotate-45 -translate-y-2"
              }`}
            />
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-white dark:bg-[#0b0f1a] p-6 flex flex-col gap-4">
            <ThemeToggle />
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                setShowModal(true);
              }}
            >
              Autoinicialização
            </button>
            <button
              onClick={handleLogout}
              className="mt-auto bg-red-500 text-white py-2 rounded"
            >
              Sair
            </button>
          </div>
        </div>
      )}

      {/* Botão parar */}
      {autoinicializacaoAtiva && (
        <button
          onClick={stopAutoinicializacao}
          className="
            fixed bottom-6 right-6 z-50
            px-5 py-3 rounded-full
            flex items-center gap-2
            bg-gradient-to-r from-red-500 to-pink-500
            text-white font-semibold
            shadow-lg hover:scale-105 transition
          "
        >
          ⏸ Parar
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
