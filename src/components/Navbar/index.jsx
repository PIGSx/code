// src/components/Navbar/index.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ModalAutoinicializacao from "../Modal";

const Navbar = () => {
  const [user, setUser] = useState(localStorage.getItem("token") ? localStorage.getItem("username") : null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [validating, setValidating] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "http://localhost:5000";

  // Validação do token sempre fora de if
  useEffect(() => {
    if (token) {
      setValidating(true);
      axios
        .post(`${API_URL}/current_user`, { token })
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
      const res = await axios.post(`${API_URL}/login`, loginForm);
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
      await axios.post(`${API_URL}/logout`, { token });
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  const navItems = [
    { label: "Downloads", path: "/download" },
    { label: "Sobre", path: "/sobre" },
  ];

  // Não exibir Navbar na página de login
  if (location.pathname === "/login") return null;

  return (
    <header className="bg-white shadow-md relative z-50">
      <nav className="container mx-auto flex justify-between items-center p-4">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          TECHNOBLADE
        </Link>

        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <span
              className="text-blue-600 font-semibold cursor-pointer"
              onClick={() => setShowModal(true)}
            >
              Autoinicialização
            </span>
          </li>
          {navItems.map((item, idx) => (
            <li key={idx}>
              <Link to={item.path} className="text-gray-600 hover:text-blue-600">
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
              <span className="text-gray-700 font-semibold">Oi, {user}</span>
              <button
                onClick={handleLogout}
                className="py-1 px-4 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="py-1 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              Login
            </button>
          )}
        </div>

        <button
          className="md:hidden ml-4 text-2xl font-bold"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </nav>

      {/* Modal Login */}
      {showLoginModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Login</h2>
            <form onSubmit={handleLogin} className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Usuário"
                className="border p-2 rounded"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, username: e.target.value })
                }
                required
              />
              <input
                type="password"
                placeholder="Senha"
                className="border p-2 rounded"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                className="py-2 bg-gray-300 hover:bg-gray-400 rounded"
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
        onConfirm={() => {
          setShowModal(false);
          alert("Autoinicialização configurada!");
        }}
      />
    </header>
  );
};

export default Navbar;
