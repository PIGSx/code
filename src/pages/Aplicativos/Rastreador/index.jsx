import React, { useState } from "react";
import api from "../../../utils/apiAxios";

export default function Rastreador() {
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
      console.error("❌ Erro ao executar rastreador:", err);
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
    <div className="
      min-h-screen
      flex flex-col items-center justify-center px-4

      bg-gray-100 text-gray-900
      dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-black 
      dark:text-gray-100
    ">
      <h1
        className="
        text-3xl font-extrabold mb-6 text-center
        bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent
        dark:from-purple-400 dark:to-blue-400
      "
      >
        Rastreador Automático
      </h1>

      <p className="text-gray-700 dark:text-gray-400 mb-8 text-center max-w-md">
        Essa função realiza o login automático no servidor e mantém o sistema externo
        aberto no navegador do servidor (não no seu navegador).
      </p>

      <button
        onClick={handleAbrirSite}
        disabled={loading}
        className="
          bg-purple-600 hover:bg-purple-700 
          dark:bg-purple-700 dark:hover:bg-purple-800
          text-white px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-50
        "
      >
        {loading ? "Executando automação..." : "Abrir sistema automaticamente"}
      </button>

      {mensagem && (
        <div
          className={`
            mt-8 text-center text-sm px-4 py-3 rounded-lg
            ${mensagem.startsWith("✅")
              ? "bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-400"
              : "bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-400"
            }
          `}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}
