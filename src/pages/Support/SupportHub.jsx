import React from "react";
import { useNavigate } from "react-router-dom";
import { Headset, ListChecks } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function SuporteHub() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBase = `
    flex flex-col justify-between
    p-6 rounded-2xl border cursor-pointer
    transition-all hover:scale-[1.02]
  `;

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors ${
        isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8">
          🛠️ Central de Suporte
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card - Abrir Chamado */}
          <div
            onClick={() => navigate("/chamados/novo")}
            className={`
              ${cardBase}
              ${
                isDark
                  ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-purple-500"
                  : "bg-white border-gray-200 hover:border-purple-400 shadow-sm"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <Headset
                size={42}
                className={isDark ? "text-purple-400" : "text-purple-600"}
              />
              <div>
                <h2 className="text-xl font-bold">Abrir Chamado</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Solicite ajuda ou registre um problema
                </p>
              </div>
            </div>
          </div>

          {/* Card - Meus Chamados */}
          <div
            onClick={() => navigate("/meus-chamados")}
            className={`
              ${cardBase}
              ${
                isDark
                  ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-blue-500"
                  : "bg-white border-gray-200 hover:border-blue-400 shadow-sm"
              }
            `}
          >
            <div className="flex items-center gap-4">
              <ListChecks
                size={42}
                className={isDark ? "text-blue-400" : "text-blue-600"}
              />
              <div>
                <h2 className="text-xl font-bold">Meus Chamados</h2>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Acompanhe respostas e status dos seus chamados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
