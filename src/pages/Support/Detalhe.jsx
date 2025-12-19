import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import api from "../../utils/apiAxios";

export default function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { fetchCount } = useNotifications();

  const isDark = theme === "dark";

  const [chamado, setChamado] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const fetchChamado = async () => {
    try {
      const res = await api.get(`/chamados/${id}`);
      setChamado(res.data);
    } catch {
      setError("Erro ao carregar chamado.");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLido = async () => {
    try {
      await api.post(`/notifications/read/${id}`);
      fetchCount();
    } catch {
      console.warn("Falha ao marcar como lido");
    }
  };

  useEffect(() => {
    fetchChamado();
    marcarComoLido();
  }, [id]);

  const enviarMensagem = async () => {
    if (!mensagem.trim()) return;

    try {
      setEnviando(true);

      await api.post(`/chamados/${id}/mensagens`, {
        texto: mensagem,
      });

      setMensagem("");
      await fetchChamado();
      fetchCount();
    } catch {
      alert("Erro ao enviar mensagem.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (error || !chamado) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className={`min-h-screen px-4 py-8 ${isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto space-y-6">

        <button onClick={() => navigate(-1)} className="text-sm text-purple-500 hover:underline">
          ← Voltar
        </button>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900">
          <h2 className="text-2xl font-bold">{chamado.titulo}</h2>
          <p className="text-sm text-gray-500">{chamado.categoria} • {chamado.criado_em}</p>
          <p className="mt-4">{chamado.descricao}</p>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-gray-900 space-y-3">
          {chamado.mensagens.map((m, i) => (
            <div key={i} className={`p-3 rounded ${m.role !== "comum" ? "bg-purple-100" : "bg-gray-100"}`}>
              <strong>{m.autor}</strong> • {m.data}
              <p>{m.texto}</p>
            </div>
          ))}
        </div>

        {chamado.status !== "Fechado" && (
          <div className="p-6 rounded-xl bg-white dark:bg-gray-900">
            <textarea
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              className="w-full p-3 rounded"
            />
            <button
              onClick={enviarMensagem}
              disabled={enviando}
              className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
            >
              {enviando ? "Enviando..." : "Enviar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
