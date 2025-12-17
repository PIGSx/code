import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamado, setChamado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  /* =============================
     Carregar chamado
     ============================= */
  const fetchChamado = async () => {
    try {
      const res = await api.get(`/chamados/${id}`);
      setChamado(res.data);
    } catch (err) {
      setError("Erro ao carregar chamado.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamado();
  }, [id]);

  /* =============================
     Enviar mensagem
     ============================= */
  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    try {
      setEnviando(true);

      await api.post(`/chamados/${id}/mensagens`, {
        texto: mensagem,
      });

      setMensagem("");
      fetchChamado(); // refresh simples
    } catch {
      alert("Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  /* =============================
     Estados globais
     ============================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando chamado...
      </div>
    );
  }

  if (error || !chamado) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Chamado não encontrado"}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen px-4 py-8 ${
        isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-purple-500 hover:underline"
          >
            ← Voltar
          </button>

          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-purple-600 text-white">
            {chamado.status}
          </span>
        </div>

        {/* Infos */}
        <div
          className={`p-6 rounded-xl border ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">{chamado.titulo}</h2>
          <p className="text-sm text-gray-500">
            {chamado.categoria} • Criado em {chamado.criado_em}
          </p>
          <p className="mt-4">{chamado.descricao}</p>
        </div>

        {/* Conversa */}
        <div
          className={`p-6 rounded-xl border space-y-4 ${
            isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <h3 className="text-lg font-bold">💬 Conversa</h3>

          {chamado.mensagens.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Nenhuma mensagem ainda.
            </p>
          ) : (
            chamado.mensagens.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  m.role === "admin" || m.role === "ti"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <div className="font-semibold">
                  {m.autor}{" "}
                  <span className="text-xs text-gray-500">
                    • {m.data}
                  </span>
                </div>
                <p className="mt-1">{m.texto}</p>
              </div>
            ))
          )}
        </div>

        {/* Nova mensagem */}
        {chamado.status !== "Fechado" && (
          <div
            className={`p-6 rounded-xl border ${
              isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h3 className="font-bold mb-2">✍️ Nova mensagem</h3>

            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
              placeholder="Digite sua mensagem..."
              className={`w-full p-3 rounded-lg border outline-none ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />

            <button
              onClick={enviarMensagem}
              disabled={enviando}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
