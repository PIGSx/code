import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Clock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function ListaChamados() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =============================
     Carregar chamados (TI/Admin)
     ============================= */
  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await api.get("/chamados");
        setChamados(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Erro ao carregar chamados."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, []);

  /* =============================
     Filtro + ordenação
     ============================= */
  const chamadosFiltrados = chamados
    .filter((c) =>
      statusFiltro === "Todos" ? true : c.status === statusFiltro
    )
    .sort(
      (a, b) => new Date(b.criado_em) - new Date(a.criado_em)
    );

  const statusStyle = (status) => {
    if (status === "Aberto")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    if (status === "Em andamento")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (status === "Respondido")
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
    if (status === "Fechado")
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    return "";
  };

  /* =============================
     Estados globais
     ============================= */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0d1117] text-gray-400" : "bg-gray-100 text-gray-600"}`}>
        Carregando chamados...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0d1117] text-red-400" : "bg-gray-100 text-red-600"}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={`min-h-screen px-4 py-10 ${isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold">
            📋 Chamados
          </h1>

          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className={`px-4 py-2 rounded-lg border outline-none ${
              isDark
                ? "bg-gray-900 border-gray-700 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            }`}
          >
            <option>Todos</option>
            <option>Aberto</option>
            <option>Respondido</option>
            <option>Em andamento</option>
            <option>Fechado</option>
          </select>
        </div>

        {/* Lista */}
        {chamadosFiltrados.length === 0 ? (
          <div className={`p-6 rounded-xl border text-center ${
            isDark
              ? "bg-gray-900 border-gray-700 text-gray-400"
              : "bg-white border-gray-200 text-gray-600"
          }`}>
            Nenhum chamado encontrado.
          </div>
        ) : (
          <div className="space-y-4">
            {chamadosFiltrados.map((chamado) => (
              <div
                key={chamado.id}
                onClick={() => navigate(`/chamados/${chamado.id}`)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all hover:scale-[1.01]
                  ${
                    isDark
                      ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-400 shadow-sm"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  {/* Infos */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {chamado.titulo}
                    </h3>

                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      {chamado.categoria} • {chamado.autor}
                    </p>

                    <div className="flex items-center gap-4 text-xs opacity-70 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {chamado.criado_em}
                      </span>

                      <span className="flex items-center gap-1">
                        <MessageSquare size={12} />
                        {chamado.mensagens?.length || 0}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded-full w-fit ${statusStyle(
                      chamado.status
                    )}`}
                  >
                    {chamado.status}
                  </span>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
