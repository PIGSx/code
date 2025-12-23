import React, { useState } from "react";
import api from "../../../utils/apiAxios";
import { useTheme } from "../../../context/ThemeContext";

export default function Camera() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAbrirCamera = async () => {
    setMensagem("");
    setLoading(true);

    try {
      const res = await api.post("/camera/abrir");

      if (res.data?.status === "success") {
        setMensagem("✅ Login automático realizado. Sistema aberto no servidor.");
      } else {
        setMensagem(res.data?.mensagem || "❌ Falha ao executar automação.");
      }
    } catch (err) {
      console.error("Erro câmera:", err);

      const msg =
        err.response?.data?.detail ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível."
          : "Erro ao conectar com o servidor.");

      setMensagem(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center justify-center px-4 transition-colors
        ${
          isDark
            ? "bg-gradient-to-b from-gray-900 via-black to-gray-950 text-gray-100"
            : "bg-gray-100 text-gray-900"
        }
      `}
    >
      {/* Título */}
      <h1
        className={`
          text-3xl font-extrabold mb-6 text-center
          bg-clip-text text-transparent
          ${
            isDark
              ? "bg-gradient-to-r from-purple-400 to-blue-400"
              : "bg-gradient-to-r from-purple-600 to-blue-600"
          }
        `}
      >
        Acesso Automático – Câmeras
      </h1>

      {/* Descrição */}
      <p
        className={`
          mb-8 text-center max-w-md
          ${isDark ? "text-gray-400" : "text-gray-700"}
        `}
      >
        Esta função realiza o login automático no sistema de câmeras e mantém
        a sessão aberta no navegador do servidor.
      </p>

      {/* Botão */}
      <button
        onClick={handleAbrirCamera}
        disabled={loading}
        className={`
          px-6 py-3 rounded-lg shadow-lg transition
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white font-semibold
          ${
            isDark
              ? "bg-purple-700 hover:bg-purple-800"
              : "bg-purple-600 hover:bg-purple-700"
          }
        `}
      >
        {loading ? "Executando automação..." : "Abrir sistema de câmeras"}
      </button>

      {/* Mensagem */}
      {mensagem && (
        <div
          className={`
            mt-8 text-center text-sm px-4 py-3 rounded-lg shadow-md
            ${
              mensagem.startsWith("✅")
                ? isDark
                  ? "bg-green-900/40 text-green-400"
                  : "bg-green-200 text-green-800"
                : isDark
                ? "bg-red-900/40 text-red-400"
                : "bg-red-200 text-red-800"
            }
          `}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}
