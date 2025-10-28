import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

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
  const [showLogin, setShowLogin] = useState(false);
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
    if (!username || !password) {
      setMessage("Preencha usuário e senha");
      return;
    }
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
        setShowLogin(false);
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

  // UPLOAD (só admins)
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error || "Upload concluído");
      if (data.message) fetchMateriais();
    } catch {
      setMessage("Erro ao enviar arquivo.");
    }
  };

  // FILTRO E PAGINAÇÃO
  const filtered = useMemo(() => {
    return materiais.filter((m) => {
      const nome = String(m["Descrição Material SAP"] || "").toLowerCase();
      const codigo = String(m["Codigo Material SAP"] || "").toLowerCase();
      const cat = String(m["CATEGORIA"] || "");
      return (
        (nome.includes(search.toLowerCase()) || codigo.includes(search.toLowerCase())) &&
        (categoria === "Todos" || cat === categoria)
      );
    });
  }, [materiais, search, categoria]);

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

  const categorias = useMemo(() => [
    "Todos",
    ...new Set(materiais.map((m) => m["CATEGORIA"]).filter(Boolean)),
  ], [materiais]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">

      {/* Cabeçalho */}
      <div className="flex justify-between items-center w-full max-w-4xl mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Lista de Materiais</h1>
        <div className="flex items-center gap-3">
          {token && <span className="text-gray-600">Olá, {user}</span>}
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
            >
              Sair
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition"
            >
              Login/Admin
            </button>
          )}
        </div>
      </div>

      {/* Formulário de login (aparece só se o usuário clicar) */}
      {showLogin && !token && (
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">Login Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-300"
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Entrar
            </button>
          </form>
          {message && <p className="text-red-500 text-sm mt-4">{message}</p>}
        </div>
      )}

      {/* Pesquisa e filtro */}
      <div className="w-full max-w-4xl mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Pesquisar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
        />
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Upload só para admins */}
      {token && (
        <div className="w-full max-w-4xl mb-6 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="file" onChange={handleUpload} className="hidden" />
            <span className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition">
              Enviar nova planilha
            </span>
          </label>
          {message && <p className="text-gray-600">{message}</p>}
        </div>
      )}

      {/* Lista de materiais */}
      <div className="w-full max-w-4xl bg-white shadow-md rounded-2xl p-4 divide-y divide-gray-100">
        {paginated.map((m, index) => (
          <div
            key={m["Codigo Material SAP"]}
            ref={index === paginated.length - 1 ? lastElementRef : null}
            className="py-4 px-2 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="text-gray-800 font-semibold">{m["Descrição Material SAP"]}</p>
              <p className="text-sm text-gray-500">{m["Codigo Material SAP"]}</p>
            </div>
            <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full mt-2 md:mt-0">
              {m["CATEGORIA"]}
            </span>
          </div>
        ))}
        {loading && <p className="text-center text-gray-400 mt-4">Carregando...</p>}
      </div>
    </div>
  );
}
