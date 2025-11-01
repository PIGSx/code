// src/components/Navbar/index.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api"; // ✅ Importando API centralizada
import ModalAutoinicializacao from "../Modal";

const Navbar = () => {
  const [user, setUser] = useState(localStorage.getItem("token") ? localStorage.getItem("username") : null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [validating, setValidating] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [autoinicializacaoAtiva, setAutoinicializacaoAtiva] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const stopRef = useRef(false); // controla parada do loop

  useEffect(() => {
    setValidating(true);
    if (token) {
      api
        .post("/current_user", { token })
        .then((res) => {
          if (res.data.logged_in) setUser(res.data.user);
          else setUser(null);
        })
        .catch(() => setUser(null))
        .finally(() => setValidating(false));
    } else {
      setValidating(false);
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", loginForm);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user);
        localStorage.setItem("role", res.data.role);
        setToken(res.data.token);
        setUser(res.data.user);
        setShowLoginModal(false);
      } else {
        alert("Usuário ou senha inválidos!");
      }
    } catch {
      alert("Erro no login!");
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", { token });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const startAutoinicializacao = async (abasSelecionadas, subCardsSelecionados, tempo, loop) => {
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
          const polosSelecionados = subCardsSelecionados["Polos"] || [];
          for (const polo of polosSelecionados) {
            if (stopRef.current) return;
            switch (polo) {
              case "955":
                navigate("/itaim");
                break;
              case "921":
                navigate("/penha");
                break;
              case "920":
                navigate("/sm");
                break;
            }
            await delay(tempo * 1000);
          }
          return;
      }

      await delay(tempo * 1000);
    };

    do {
      for (const aba of abasSelecionadas) {
        if (stopRef.current) break;
        await navegarAba(aba);
      }
    } while (loop && !stopRef.current);

    setAutoinicializacaoAtiva(false);
  };

  const stopAutoinicializacao = () => {
    stopRef.current = true;
    setAutoinicializacaoAtiva(false);
  };

  const navItems = [
    { label: "Downloads", path: "/download" },
    { label: "Sobre", path: "/sobre" },
  ];

  if (location.pathname === "/login") return null;

  return (
    <header className="bg-gray-900 shadow-lg relative z-50">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold text-purple-400">
          TECHNOBLADE
        </Link>

        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <span
              className="text-purple-300 font-semibold cursor-pointer hover:text-purple-400 transition"
              onClick={() => setShowModal(true)}
            >
              Autoinicialização
            </span>
          </li>
          {navItems.map((item, idx) => (
            <li key={idx}>
              <Link
                to={item.path}
                className="text-gray-300 hover:text-purple-300 transition"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center space-x-4">
          {validating ? (
            <span className="text-gray-500 animate-pulse">Verificando login...</span>
          ) : user ? (
            <>
              <span className="text-gray-200 font-semibold">Oi, {user}</span>
              <button
                onClick={handleLogout}
                className="py-1 px-4 bg-red-600 hover:bg-red-700 text-white rounded transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="py-1 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
            >
              Login
            </button>
          )}
        </div>

        <button
          className="md:hidden ml-4 text-2xl font-bold text-purple-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700">
          <ul className="flex flex-col space-y-2 p-4">
            <li>
              <span
                className="text-purple-300 font-semibold cursor-pointer hover:text-purple-400 transition"
                onClick={() => {
                  setShowModal(true);
                  setMenuOpen(false);
                }}
              >
                Autoinicialização
              </span>
            </li>
            {navItems.map((item, idx) => (
              <li key={idx}>
                <Link
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-300 hover:text-purple-300 transition"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {user ? (
              <li>
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMenuOpen(false);
                  }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                >
                  Login
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Botão flutuante */}
      {autoinicializacaoAtiva && (
        <button
          onClick={stopAutoinicializacao}
          className="fixed bottom-6 right-6 z-50 bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
          title="Parar Autoinicialização"
        >
          ⏹
        </button>
      )}

      {/* Modal Login */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-800 p-6 rounded shadow-lg w-80 text-gray-100">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Usuário"
                className="border border-gray-600 bg-gray-700 p-2 rounded text-gray-200 placeholder-gray-400 focus:ring focus:ring-purple-500 outline-none"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Senha"
                className="border border-gray-600 bg-gray-700 p-2 rounded text-gray-200 placeholder-gray-400 focus:ring focus:ring-purple-500 outline-none"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="py-2 bg-gray-600 hover:bg-gray-700 rounded text-gray-200 transition"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Autoinicialização */}
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
