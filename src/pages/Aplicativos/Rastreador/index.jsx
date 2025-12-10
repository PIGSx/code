import React, { useState } from "react";
import api from "../../../utils/apiAxios";
import { useTheme } from "../../../context/ThemeContext";

export default function Rastreador() {
  const { theme } = useTheme(); // <<<<<<<<<< AQUI PEGAMOS O TEMA
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAbrirSite = async () => {
    setMensagem("");
    setLoading(true);

    try {
      const res = await api.post("/rastreador/abrir-site");

      if (res.data?.status === "success") {
        setMensagem("✅ Login feito no servidor. Site aberto no navegador do servidor.");
      } else {
        setMensagem(res.data?.mensagem || "❌ Falha ao executar o rastreador.");
      }
    } catch (err) {
      console.error("❌ Erro:", err);
      const msg =
        err.response?.data?.detail ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Verifique sua conexão."
          : "Erro ao conectar com o servidor.");
      setMensagem(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center justify-center px-4

        ${theme === "dark"
          ? "bg-gradient-to-b from-gray-900 via-black to-gray-950 text-gray-100"
          : "bg-gray-100 text-gray-900"}
      `}
    >
      <h1
        className={`
          text-3xl font-extrabold mb-6 text-center
          bg-clip-text text-transparent
          ${theme === "dark"
            ? "bg-gradient-to-r from-purple-400 to-blue-400"
            : "bg-gradient-to-r from-purple-600 to-blue-600"}
        `}
      >
        Rastreador Automático
      </h1>

      <p
        className={`
          mb-8 text-center max-w-md
          ${theme === "dark" ? "text-gray-400" : "text-gray-700"}
        `}
      >
        Essa função realiza o login automático no servidor e mantém o sistema externo
        aberto no navegador do servidor.
      </p>

      <button
        onClick={handleAbrirSite}
        disabled={loading}
        className={`
          px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-50 text-white font-semibold

          ${theme === "dark"
            ? "bg-purple-700 hover:bg-purple-800"
            : "bg-purple-600 hover:bg-purple-700"}
        `}
      >
        {loading ? "Executando automação..." : "Abrir sistema automaticamente"}
      </button>

      {mensagem && (
        <div
          className={`
            mt-8 text-center text-sm px-4 py-3 rounded-lg shadow-md
            ${
              mensagem.startsWith("✅")
                ? theme === "dark"
                  ? "bg-green-900/40 text-green-400"
                  : "bg-green-200 text-green-800"
                : theme === "dark"
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
