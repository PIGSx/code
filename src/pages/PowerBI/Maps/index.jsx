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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Rastreador Automático
      </h1>

      <p className="text-gray-400 mb-8 text-center max-w-md">
        Essa função realiza o login automático no servidor e mantém o sistema externo
        aberto no navegador do servidor (não no seu navegador).
      </p>

      <button
        onClick={handleAbrirSite}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-50"
      >
        {loading ? "Executando automação..." : "Abrir sistema automaticamente"}
      </button>

      {mensagem && (
        <div
          className={`mt-8 text-center text-sm px-4 py-3 rounded-lg ${
            mensagem.startsWith("✅")
              ? "bg-green-900/40 text-green-400"
              : "bg-red-900/40 text-red-400"
          }`}
        >
          {mensagem}
        </div>
      )}
    </div>
  );
}
