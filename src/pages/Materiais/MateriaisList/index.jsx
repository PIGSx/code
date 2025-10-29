import React, { useState, useEffect, useRef, useCallback } from "react";
import { LogOut, Upload, Search } from "lucide-react";

export default function MateriaisApp() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(localStorage.getItem("user") || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [materiais, setMateriais] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const itemsPerPage = 15;

  const AUTH_URL =
    window.location.hostname === "localhost"
      ? "http://127.0.0.1:5004"
      : "https://auth.onrender.com";
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://127.0.0.1:5003"
      : "https://materiais.onrender.com";

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", data.user);
        setToken(data.token);
        setUser(data.user);
        setMessage("");
        setUsername("");
        setPassword("");
      } else {
        setMessage(data.message || "Usuário ou senha inválidos.");
      }
    } catch {
      setMessage("Erro ao conectar com o servidor.");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser("");
  };

  // FETCH MATERIAIS
  const fetchMateriais = async () => {
    try {
      const res = await fetch(`${API_URL}/materiais`);
      const data = await res.json();
      setMateriais(data);
    } catch {
      setMessage("Erro ao carregar materiais.");
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  // UPLOAD (somente com token)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!token) {
      setMessage("Você precisa estar logado para enviar planilhas.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.message) fetchMateriais();
    } catch {
      setMessage("Erro ao enviar arquivo.");
    }
  };

  // FILTRO
  const filtered = materiais.filter((m) => {
    const nome = String(m["Descrição Material SAP"] || "").toLowerCase();
    const codigo = String(m["Codigo Material SAP"] || "").toLowerCase();
    const cat = String(m["CATEGORIA"] || "");
    return (
      (nome.includes(search.toLowerCase()) ||
        codigo.includes(search.toLowerCase())) &&
      (categoria === "Todos" || cat === categoria)
    );
  });

  const paginated = filtered.slice(0, page * itemsPerPage);

  const lastElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && paginated.length < filtered.length) {
          setLoading(true);
          setTimeout(() => {
            setPage((prev) => prev + 1);
            setLoading(false);
          }, 600);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, filtered.length, paginated.length]
  );

  const categorias = [
    "Todos",
    ...new Set(materiais.map((m) => m["CATEGORIA"]).filter(Boolean)),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center py-10 px-4">
      <div className="flex justify-between items-center w-full max-w-5xl mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Lista de Materiais
        </h1>

        {token ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-300">Olá, {user}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-600/80 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-all"
            >
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleLogin}
            className="flex gap-2 items-center bg-gray-800 p-2 rounded-xl shadow-md border border-gray-700"
          >
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-1 bg-transparent border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-1 bg-transparent border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              Entrar
            </button>
          </form>
        )}
      </div>

      {/* Barra de Filtro */}
      <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:ring focus:ring-blue-500 outline-none"
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Upload */}
      {token && (
        <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer bg-green-600/80 hover:bg-green-700 px-4 py-2 rounded-lg transition-all">
            <Upload className="w-5 h-5" />
            <span>Enviar nova planilha</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
          {message && <p className="text-gray-400 text-sm">{message}</p>}
        </div>
      )}

      {/* Lista */}
      <div className="w-full max-w-5xl bg-gray-900/60 backdrop-blur-lg shadow-xl rounded-2xl border border-gray-800 divide-y divide-gray-800">
        {paginated.map((m, index) => {
          const isLast = index === paginated.length - 1;
          return (
            <div
              key={m["Codigo Material SAP"] || index}
              ref={isLast ? lastElementRef : null}
              className="py-4 px-4 hover:bg-gray-800/60 transition flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-gray-100 font-semibold">
                  {m["Descrição Material SAP"]}
                </p>
                <p className="text-sm text-gray-500">
                  {m["Codigo Material SAP"]}
                </p>
              </div>
              <span className="text-sm bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full mt-2 md:mt-0 border border-blue-700/30">
                {m["CATEGORIA"]}
              </span>
            </div>
          );
        })}
        {loading && (
          <p className="text-center text-gray-400 py-4 animate-pulse">
            Carregando...
          </p>
        )}
      </div>
    </div>
  );
}
