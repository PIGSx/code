// src/pages/Chamados/MeusChamados.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function MeusChamados() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");

  /* =============================
     Buscar chamados do usuário
     ============================= */
  const fetchChamados = async () => {
    try {
      const res = await api.get("/meus-chamados");
      setChamados(res.data || []);
    } catch {
      setError("Erro ao carregar seus chamados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando chamados...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        isDark
          ? "bg-[#0d1117] text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-3xl font-extrabold">📨 Meus Chamados</h1>

        {chamados.length === 0 ? (
          <p className="text-gray-500">
            Você ainda não abriu nenhum chamado.
          </p>
        ) : (
          <div className="space-y-4">
            {chamados.map((c) => {
              const naoLido =
                c.nao_lido_por?.includes(username);

              return (
                <Link
                  key={c.id}
                  to={`/chamados/${c.id}`}
                  className={`block p-5 rounded-xl border transition relative ${
                    naoLido
                      ? isDark
                        ? "border-purple-500 bg-purple-900/20"
                        : "border-purple-400 bg-purple-50"
                      : isDark
                        ? "border-gray-700 bg-gray-900"
                        : "border-gray-200 bg-white"
                  }`}
                >
                  {/* 🔔 Badge não lido */}
                  {naoLido && (
                    <span className="absolute top-3 right-3 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                      Nova resposta
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">
                      {c.titulo}
                    </h2>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        c.status === "Fechado"
                          ? "bg-gray-400 text-white"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 mt-1">
                    {c.categoria} • {c.criado_em}
                  </p>

                  <p className="mt-3 line-clamp-2">
                    {c.descricao}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
