import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Lock } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export default function DetalheChamado() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [mensagens, setMensagens] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [statusChamado, setStatusChamado] = useState("Aberto");
  const wsRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Conectar WebSocket
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:5055/ws/${id}`);
    wsRef.current = ws;

    ws.onopen = () => console.log("WebSocket conectado:", id);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMensagens((prev) => [...prev, msg]);
    };
    ws.onclose = () => console.log("WebSocket desconectado:", id);

    return () => ws.close();
  }, [id]);

  // Mock inicial do chamado (pode vir do backend)
  useEffect(() => {
    const chamado = {
      titulo: "Erro ao acessar o sistema",
      categoria: "Sistema",
      mensagens: [
        { autor: "usuario", texto: "Não consigo acessar o sistema desde ontem.", data: "12/12/2025 09:20" },
        { autor: "ti", texto: "Bom dia! Estamos verificando o ocorrido.", data: "12/12/2025 09:35" },
      ],
    };
    setMensagens(chamado.mensagens);
    inputRef.current?.focus();
  }, []);

  // Scroll automático para a última mensagem
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const isFechado = statusChamado === "Fechado";

  const enviarMensagem = () => {
    if (!mensagem.trim() || !wsRef.current) return;

    const novaMensagem = {
      autor: "usuario",
      texto: mensagem,
      data: new Date().toLocaleString(),
    };

    wsRef.current.send(JSON.stringify(novaMensagem));
    setMensagem("");
    inputRef.current?.focus();
  };

  return (
    <div className={`min-h-screen px-4 py-8 transition-colors duration-300 ${isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-4xl mx-auto">

        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className={`p-2 rounded-lg transition ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-200 border"}`}>
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-xl font-bold">Erro ao acessar o sistema</h1>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>Sistema • Chamado #{id}</p>
          </div>

          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-semibold ${statusChamado === "Aberto" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : statusChamado === "Em andamento" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}>
            {statusChamado}
          </span>
        </div>

        {/* Chat */}
        <div className={`rounded-2xl p-4 space-y-4 border transition max-h-[60vh] overflow-y-auto ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"}`}>
          {mensagens.map((msg, idx) => {
            const isUser = msg.autor === "usuario";
            return (
              <div key={idx} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-xl text-sm shadow ${isUser ? "bg-purple-600 text-white rounded-br-none" : isDark ? "bg-gray-800 text-gray-100 rounded-bl-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                  <p>{msg.texto}</p>
                  <span className="block mt-1 text-xs opacity-70">{msg.data}</span>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="mt-4">
          {isFechado ? (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${isDark ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-white border-gray-300 text-gray-600"}`}>
              <Lock size={16} />
              Este chamado está fechado e não pode receber novas mensagens.
            </div>
          ) : (
            <div className={`flex items-center gap-2 p-2 rounded-xl border transition ${isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-300"}`}>
              <input
                ref={inputRef}
                type="text"
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite sua mensagem..."
                className={`flex-1 bg-transparent outline-none text-sm ${isDark ? "placeholder-gray-500" : "placeholder-gray-400"}`}
                onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              />
              <button onClick={enviarMensagem} className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition">
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
