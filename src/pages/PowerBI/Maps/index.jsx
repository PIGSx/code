// src/pages/PowerBI/Rastreador.jsx
import React, { useState, useEffect } from "react";
import { getRole, getToken, clearAuth } from "../../../utils/auth";

export default function Rastreador() {
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const token = getToken();
  const API_URL = "http://127.0.0.1:5000";

  useEffect(() => {
    const role = getRole();
    setIsAdmin(role === "admin");
  }, []);

  const handleAbrirSite = async () => {
    if (!token || !isAdmin) {
      setMensagem("🚫 Apenas administradores podem executar o rastreador.");
      return;
    }

    setMensagem("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/rastreador/login`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.status === "success") setMensagem(`✅ ${data.mensagem}`);
      else setMensagem(`❌ Erro: ${data.mensagem || "Falha ao acessar o site"}`);
    } catch (err) {
      setMensagem("❌ Erro ao conectar com o servidor");
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
        Essa função realiza login automático no sistema externo de rastreamento.
      </p>

      {isAdmin ? (
        <button
          onClick={handleAbrirSite}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition disabled:opacity-50"
        >
          {loading ? "Acessando o site..." : "Iniciar Rastreador"}
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
