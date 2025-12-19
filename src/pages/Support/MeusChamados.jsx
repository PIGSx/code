import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function MeusChamados() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await api.get("/meus-chamados");
        setChamados(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar seus chamados.");
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, []);

  const statusStyle = (status) => {
    if (status === "Aberto")
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    if (status === "Em andamento")
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
    if (status === "Fechado")
      return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-300 ${
        isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold">📋 Meus Chamados</h1>

          <button
            onClick={() => navigate("/chamados/novo")}
            className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition"
          >
            + Abrir Chamado
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className={`p-6 rounded-xl border text-center animate-pulse ${
              isDark
                ? "bg-gray-900 border-gray-700 text-gray-400"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            Carregando chamados...
          </div>
        )}

        {/* Erro */}
        {!loading && error && (
          <div
            className={`p-6 rounded-xl border text-center ${
              isDark
                ? "bg-gray-900 border-gray-700 text-red-400"
                : "bg-white border-gray-200 text-red-600"
            }`}
          >
            {error}
          </div>
        )}

        {/* Lista vazia */}
        {!loading && !error && chamados.length === 0 && (
          <div
            className={`p-6 rounded-xl border text-center ${
              isDark
                ? "bg-gray-900 border-gray-700 text-gray-400"
                : "bg-white border-gray-200 text-gray-600"
            }`}
          >
            Nenhum chamado encontrado.
          </div>
        )}

        {/* Lista */}
        {!loading && !error && chamados.length > 0 && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto">
            {chamados.map((chamado) => {
              const ultimaMsg =
                chamado.mensagens?.[chamado.mensagens.length - 1];

              return (
                <div
                  key={chamado.id}
                  onClick={() => navigate(`/chamados/${chamado.id}`)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer hover:scale-[1.01] ${
                    isDark
                      ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-400 shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        Chamado #{chamado.id}
                      </h3>

                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Criado em{" "}
                        {chamado.criado_em
                          ? new Date(chamado.criado_em).toLocaleString()
                          : "—"}
                      </p>

                      {ultimaMsg && (
                        <p className="text-sm mt-1 truncate text-gray-500">
                          {ultimaMsg.texto}
                        </p>
                      )}
                    </div>

                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full w-fit ${statusStyle(
                        chamado.status
                      )}`}
                    >
                      {chamado.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
