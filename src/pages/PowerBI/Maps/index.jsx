import React, { useState, useEffect } from "react";
import { getRole, clearAuth } from "../../../utils/auth";
import api from "../../../utils/apiAxios"; // ✅ Novo cliente Axios com interceptores e baseURL dinâmica

export default function Rastreador() {
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const role = getRole();
    setIsAdmin(role === "admin");
  }, []);

  const handleAbrirSite = async () => {
    if (!isAdmin) {
      setMensagem("🚫 Apenas administradores podem executar o rastreador.");
      return;
    }

    setMensagem("");
    setLoading(true);

    try {
      // ✅ Agora usando a instância `apiAxios`, que já injeta o token automaticamente
      const res = await api.post("/rastreador/abrir-site");

      if (res.data?.status === "success") {
        setMensagem("✅ Login feito no servidor. Tentando abrir site no seu navegador...");

        const win = window.open("https://web.hapolo.com.br/", "_blank");

        // ⚠️ Tentativa de aplicar cookies retornados (limitada pelo navegador)
        if (res.data.cookies && res.data.cookies.length && win) {
          res.data.cookies.forEach((c) => {
            try {
              win.document.cookie = `${c.name}=${c.value}; path=${c.path || "/"};`;
            } catch (e) {
              console.warn("Não foi possível aplicar cookie no navegador do usuário", c, e);
            }
          });
        }
      } else {
        setMensagem(res.data?.mensagem || "❌ Falha ao executar o rastreador.");
      }
    } catch (err) {
      console.error("❌ Erro ao executar rastreador:", err);
      const msg =
        err.response?.data?.mensagem ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Verifique sua conexão."
          : "Erro ao conectar com o servidor.");
      setMensagem(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-extrabold mb-6 text-center bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Rastreador Automático
      </h1>

      <p className="text-gray-400 mb-8 text-center max-w-md">
        Essa função realiza login automático no sistema externo de rastreamento (executado no servidor com Chrome headless).
      </p>

      {isAdmin ? (
        <button
          onClick={handleAbrirSite}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Executando automação..." : "Abrir site já logado"}
        </button>
      ) : (
        <p className="text-red-500 font-medium">
          🚫 Acesso restrito — apenas administradores podem executar o rastreador.
        </p>
      )}

      <button
        onClick={handleLogout}
        className="mt-6 text-red-400 hover:text-red-500 transition"
      >
        Sair
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
