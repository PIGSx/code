import React, { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Search } from "lucide-react";
import api from "../../../../utils/apiAxios";
import { getRole } from "../../../../utils/auth";
import { useTheme } from "../../../../context/ThemeContext";

export default function MateriaisList() {
  const { theme } = useTheme();

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
      setMateriais(Array.isArray(res.data) ? res.data : []);
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

  const categorias = [
    "Todos",
    ...new Set(materiais.map((m) => m["CATEGORIA"]).filter(Boolean)),
  ];

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
      setMessage(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao enviar arquivo."
      );
    }
  };

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
            : "bg-gray-50 text-gray-900"
        }
      `}
    >
      {/* TÍTULO */}
      <h1
        className="
          text-3xl font-extrabold tracking-tight mb-8
          bg-gradient-to-r from-blue-500 to-cyan-400
          bg-clip-text text-transparent
        "
      >
        Lista de Materiais
      </h1>
    {/* Filtros */}
      <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou código..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`
              w-full rounded-lg px-10 py-2 outline-none transition
              ${
                theme === "dark"
                  ? "bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
              }
            `}
          />
        </div>

        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value);
            setPage(1);
          }}
          className={`
            px-4 py-2 rounded-lg outline-none transition
            ${
              theme === "dark"
                ? "bg-gray-800 border border-gray-700 text-gray-200"
                : "bg-white border border-gray-300 text-gray-900"
            }
          `}
        >
          {categorias.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* UPLOAD */}
      {role?.toLowerCase() === "admin" && (
        <div className="w-full max-w-5xl mb-6 flex justify-between items-center">
          <label className="flex items-center gap-2 cursor-pointer bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition">
            <Upload className="w-5 h-5" />
            <span>Enviar nova planilha</span>
            <input type="file" onChange={handleUpload} className="hidden" />
          </label>
          {message && <p className="text-sm text-gray-500">{message}</p>}
        </div>
      )}

      {/* LISTA */}
      <div
        className={`
          w-full max-w-5xl rounded-2xl overflow-hidden border transition
          ${
            theme === "dark"
              ? "bg-gray-900/60 border-gray-800 divide-y divide-gray-800"
              : "bg-white border-gray-200 divide-y divide-gray-100 shadow-lg"
          }
        `}
      >
        {paginated.map((m, index) => {
          const isLast = index === paginated.length - 1;

          return (
            <div
              key={m["Codigo Material SAP"] || index}
              ref={isLast ? lastElementRef : null}
              className={`
                px-5 py-4 transition-colors duration-200
                flex flex-col md:flex-row md:items-center md:justify-between
                ${
                  theme === "dark"
                    ? "hover:bg-gray-800/60"
                    : "hover:bg-blue-50"
                }
              `}
            >
              <div>
                <p
                  className={
                    theme === "dark"
                      ? "text-gray-100 font-medium"
                      : "text-gray-900 font-semibold"
                  }
                >
                  {m["Descrição Material SAP"]}
                </p>
                <p
                  className={
                    theme === "dark"
                      ? "text-gray-500 text-sm"
                      : "text-gray-600 text-sm"
                  }
                >
                  {m["Codigo Material SAP"]}
                </p>
              </div>

                <span
                className={`
                  text-xs font-medium px-3 py-1 rounded-full mt-2 md:mt-0
                  ${
                    theme === "dark"
                      ? "bg-blue-600/20 text-blue-300 border border-blue-600/30"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }
                `}
              >
                {m["CATEGORIA"]}
              </span>
            </div>
          );
        })}

        {loading && (
          <p className="text-center py-4 text-gray-500 animate-pulse">
            Carregando...
          </p>
        )}
      </div>
    </div>
  );
}
