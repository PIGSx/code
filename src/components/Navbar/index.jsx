import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/apiAxios";
import ModalAutoinicializacao from "../Modal";
import ThemeToggle from "../ThemeToggle";

const Navbar = () => {
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "comum");
  const [validating, setValidating] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoinicializacaoAtiva, setAutoinicializacaoAtiva] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const stopRef = useRef(false);

  if (window.tokenExpirado === undefined) window.tokenExpirado = false;

  // =========================
  // Interceptor token expirado
  // =========================
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

  // =========================
  // Validação inicial
  // =========================
  useEffect(() => {
    const validarUsuario = async () => {
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

    validarUsuario();
  }, [token]);

  // =========================
  // Login
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/login", loginForm);

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user);
        localStorage.setItem("role", res.data.role);

        window.tokenExpirado = false;

        setToken(res.data.token);
        setUser(res.data.user);
        setRole(res.data.role);
        setShowLoginModal(false);
      } else {
        alert("Usuário ou senha inválidos!");
      }
    } catch {
      alert("Erro ao conectar com o servidor.");
    }
  };

  // =========================
  // Logout
  // =========================
  const handleLogout = async () => {
    try {
      await api.post("/logout", { token });
    } catch {}
    localStorage.clear();
    setToken("");
    setUser(null);
    setRole("comum");
    navigate("/login");
  };

  // =========================
  // Helpers de role
  // =========================
  const ROLE_LEVEL = {
    comum: 1,
    admin: 2,
    ti: 3,
  };

  const hasRole = (minRole) =>
    ROLE_LEVEL[role] >= ROLE_LEVEL[minRole];

  // =========================
  // Delay
  // =========================
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // =========================
  // Autoinicialização
  // =========================
  const startAutoinicializacao = async (abas, subCards, tempo, loop) => {
    setAutoinicializacaoAtiva(true);
    stopRef.current = false;

    const navegarAba = async (aba) => {
      if (stopRef.current) return;

      switch (aba) {
        case "materiais":
          navigate("/materiais");
          break;
        case "rastreador":
          navigate("/rastreador");
          break;
        case "Ptrac":
          navigate("/ptrac");
          break;
        case "Carteira":
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
        await navegarAba(aba);
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

  // =========================
  // Menu
  // =========================
  const navItems = [
    { label: "Downloads", path: "/download" },
    hasRole("admin")
      ? { label: "Chamados", path: "/chamados" }
      : { label: "Suporte", path: "/suporte" },
  ];

  if (location.pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-white to-gray-100 dark:from-[#0b0f1a] dark:to-[#0d1117] border-b border-black/5 dark:border-white/5 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-400 bg-clip-text text-transparent">
          TECHNOBLADE
        </Link>

        <ul className="hidden md:flex items-center gap-6">
          <li>
            <button onClick={() => setShowModal(true)} className="text-sm font-medium text-purple-600 dark:text-purple-400">
              Autoinicialização
            </button>
          </li>

          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {validating ? (
            <span className="text-sm text-gray-400">Verificando login...</span>
          ) : user ? (
            <>
              <span className="text-sm font-semibold">
                Oi, {user}
                <span className="ml-1 text-xs opacity-60">({role})</span>
              </span>
              <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg bg-red-500 text-white">
                Sair
              </button>
            </>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="px-4 py-1.5 rounded-lg bg-purple-600 text-white">
              Login
            </button>
          )}
        </div>

        <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </nav>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <ul className="flex flex-col gap-3 p-4">
            <li>
              <button onClick={() => { setShowModal(true); setMenuOpen(false); }} className="font-medium">
                Autoinicialização
              </button>
            </li>

            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path} onClick={() => setMenuOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}

            {user ? (
              <button onClick={handleLogout} className="mt-2 py-2 bg-red-500 text-white rounded">
                Logout
              </button>
            ) : (
              <button onClick={() => { setShowLoginModal(true); setMenuOpen(false); }} className="mt-2 py-2 bg-purple-600 text-white rounded">
                Login
              </button>
            )}
          </ul>
        </div>
      )}

      {autoinicializacaoAtiva && (
        <button onClick={stopAutoinicializacao} className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-500 text-white">
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
