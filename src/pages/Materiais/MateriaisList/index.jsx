// src/pages/MateriaisList/index.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Search } from "lucide-react";
import { getToken, getRole } from "../../../utils/auth";

export default function MateriaisList() {
  const [materiais, setMateriais] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const itemsPerPage = 15;

  const token = getToken();
  const role = getRole();
  const API_URL = "http://127.0.0.1:5000";

  // --- Hooks: fetch materiais ---
  const fetchMateriais = async () => {
    try {
      const res = await fetch(`${API_URL}/materiais`);
      const data = await res.json();
      setMateriais(data);
    } catch (err) {
      setMessage("Erro ao carregar materiais.");
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

  // --- Filtro paginado ---
  const filtered = materiais.filter((m) => {
    const nome = String(m["Descrição Material SAP"] || "").toLowerCase();
    const codigo = String(m["Codigo Material SAP"] || "").toLowerCase();
    const cat = String(m["CATEGORIA"] || "");
    return (
      (nome.includes(search.toLowerCase()) || codigo.includes(search.toLowerCase())) &&
      (categoria === "Todos" || cat === categoria)
    );
  });

  const paginated = filtered.slice(0, page * itemsPerPage);

  // --- Infinite scroll ---
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

  const categorias = ["Todos", ...new Set(materiais.map((m) => m["CATEGORIA"]).filter(Boolean))];

  // --- Upload (apenas admin) ---
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_URL}/upload_materiais`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });
      const data = await res.json();
      setMessage(data.message || data.error);
      if (data.message) fetchMateriais();
    } catch {
      setMessage("Erro ao enviar arquivo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-8">
        Lista de Materiais
      </h1>

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

      {/* Upload somente admin */}
      {role?.toLowerCase() === "admin" && (
        <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer bg-green-600/80 hover:bg-green-700 px-4 py-2 rounded-lg transition-all">
            <Upload className="w-5 h-5" />
            <span>Enviar nova planilha</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
          {message && <p className="text-gray-400 text-sm">{message}</p>}
        </div>
      )}

      {/* Lista de materiais */}
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
                <p className="text-gray-100 font-semibold">{m["Descrição Material SAP"]}</p>
                <p className="text-sm text-gray-500">{m["Codigo Material SAP"]}</p>
              </div>
              <span className="text-sm bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full mt-2 md:mt-0 border border-blue-700/30">
                {m["CATEGORIA"]}
              </span>
            </div>
          );
        })}
        {loading && <p className="text-center text-gray-400 py-4 animate-pulse">Carregando...</p>}
      </div>
    </div>
  );
}
