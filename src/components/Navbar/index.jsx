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
     Interceptor – token expirado
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
     Validação do usuário
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
    setToken(null);
    setUser(null);
    setRole("comum");
    navigate("/login");
  };

  /* =========================
     Controle de roles
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

      switch (aba) {
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
        case "Polos":
          const polos = subCards["Polos"] || [];
          for (const polo of polos) {
            if (stopRef.current) return;
            if (polo === "955") navigate("/itaim");
            if (polo === "921") navigate("/penha");
            if (polo === "920") navigate("/sm");
            await delay(tempo * 1000);
          }
          return;
        default:
          break;
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

    if (window.tokenExpirado) {
      localStorage.clear();
      navigate("/login");
    }
  };

  const stopAutoinicializacao = () => {
    stopRef.current = true;
    setAutoinicializacaoAtiva(false);

    if (window.tokenExpirado) {
      localStorage.clear();
      navigate("/login");
    }
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
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-100 dark:from-[#0b0f1a] dark:to-[#0d1117] border-b border-black/5 dark:border-white/5">
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
              <Link
                to={item.path}
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {item.label}

                {item.showBadge && count > 0 && (
                  <span className="absolute -top-2 -right-4 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {count}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {validating ? (
            <span className="text-sm text-gray-400">Verificando login...</span>
          ) : user ? (
            <>
              <span className="text-sm font-semibold">
                Oi, {user}{" "}
                <span className="text-xs opacity-60">({role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-lg bg-red-500 text-white"
              >
                Sair
              </button>
            </>
          ) : null}
        </div>

        {/* Mobile */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <ul className="flex flex-col gap-3 p-4">
            {navItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  {item.label}
                  {item.showBadge && count > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 rounded-full">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            ))}

            <button
              onClick={handleLogout}
              className="mt-3 py-2 bg-red-500 text-white rounded"
            >
              Logout
            </button>
          </ul>
        </div>
      )}

      {autoinicializacaoAtiva && (
        <button
          onClick={stopAutoinicializacao}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-500 text-white"
        >
          ⏹
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
    </header>
  );
};

export default Navbar;
