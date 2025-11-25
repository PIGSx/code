import React, { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Search } from "lucide-react";
import api from "../../../../utils/apiAxios";
import { getRole } from "../../../../utils/auth";

export default function MateriaisList() {
  const [materiais, setMateriais] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("Todos");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const observer = useRef();
  const itemsPerPage = 15;

  const role = getRole();

  const fetchMateriais = async () => {
    try {
      const res = await api.get("/materiais");
      if (Array.isArray(res.data)) {
        setMateriais(res.data);
      } else {
        console.warn("⚠️ Resposta inesperada:", res.data);
        setMateriais([]);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar materiais:", err);
      setMessage("Erro ao carregar materiais.");
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, []);

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

  const categorias = ["Todos", ...new Set(materiais.map((m) => m["CATEGORIA"]).filter(Boolean))];

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/upload_materiais", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || res.data.error || "Erro desconhecido");
      if (res.data.message) fetchMateriais();
    } catch (err) {
      console.error("❌ Erro ao enviar arquivo:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Erro ao enviar arquivo.";
      setMessage(msg);
    }
  };

  return (
    // ❌ removido fundo fixo da página
    // ✔ agora herda automático do App + darkmode futuramente
    <div className="min-h-screen flex flex-col items-center py-10 px-4">

      <h1 className="text-3xl font-extrabold tracking-tight 
        bg-gradient-to-r from-blue-400 to-cyan-300 
        bg-clip-text text-transparent mb-8">
        Lista de Materiais
      </h1>

      {/* Barra de Filtro */}
      <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-200 dark:bg-gray-800 
              border border-gray-300 dark:border-gray-700 
              rounded-lg px-10 py-2 
              text-gray-900 dark:text-gray-200 
              placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
          />
        </div>

        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 
            border border-gray-300 dark:border-gray-700 
            rounded-lg text-gray-900 dark:text-gray-200 
            focus:ring focus:ring-blue-500 outline-none"
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Upload (somente admin) */}
      {role?.toLowerCase() === "admin" && (
        <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer 
            bg-green-600/80 hover:bg-green-700 px-4 py-2 
            rounded-lg transition-all text-white">
            <Upload className="w-5 h-5" />
            <span>Enviar nova planilha</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
          {message && <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>}
        </div>
      )}

      {/* Lista de Materiais */}
      <div className="w-full max-w-5xl 
        bg-white/40 dark:bg-gray-900/60 
        backdrop-blur-lg shadow-xl rounded-2xl 
        border border-gray-300 dark:border-gray-800 
        divide-y divide-gray-300 dark:divide-gray-800">

        {paginated.map((m, index) => {
          const isLast = index === paginated.length - 1;
          return (
            <div
              key={m["Codigo Material SAP"] || index}
              ref={isLast ? lastElementRef : null}
              className="py-4 px-4 hover:bg-gray-200/50 dark:hover:bg-gray-800/60 
                transition flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className="text-gray-900 dark:text-gray-100 font-semibold">
                  {m["Descrição Material SAP"]}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-500">
                  {m["Codigo Material SAP"]}
                </p>
              </div>

              <span className="text-sm 
                bg-blue-600/10 dark:bg-blue-600/20 
                text-blue-700 dark:text-blue-300 
                px-3 py-1 rounded-full mt-2 md:mt-0 
                border border-blue-700/20 dark:border-blue-700/30">
                {m["CATEGORIA"]}
              </span>
            </div>
          );
        })}

        {loading && (
          <p className="text-center text-gray-600 dark:text-gray-400 py-4 animate-pulse">
            Carregando...
          </p>
        )}
      </div>
    </div>
  );
}
