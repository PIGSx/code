import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function MeusChamados() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =============================
     Carregar chamados
     ============================= */
  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const res = await api.get("/meus-chamados");
        setChamados(res.data || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            err.response?.data?.message ||
            "Erro ao carregar seus chamados."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChamados();
  }, []);

  /* =============================
     Helpers
     ============================= */
  const isNaoLido = (chamado) => {
    const lastRead = localStorage.getItem(`chamado_lido_${chamado.id}`);
    const ultimaMsg = chamado.mensagens?.at(-1);

    if (!ultimaMsg) return false;
    if (ultimaMsg.autor === chamado.autor) return false;

    return !lastRead || lastRead < ultimaMsg.data;
  };

  const infoTexto = (chamado) => {
    if (chamado.status === "Fechado") return "Chamado fechado";
    if (!chamado.mensagens?.length) return "Aguardando resposta do TI";

    const ultimaMsg = chamado.mensagens.at(-1);
    return ultimaMsg.autor !== chamado.autor
      ? "TI respondeu"
      : "Aguardando retorno do TI";
  };

  const ordenarChamados = (lista) => {
    return [...lista].sort((a, b) => {
      const dataA =
        a.mensagens?.at(-1)?.data || a.criado_em;
      const dataB =
        b.mensagens?.at(-1)?.data || b.criado_em;

      return new Date(dataB) - new Date(dataA);
    });
  };

  const abrirChamado = (id) => {
    localStorage.setItem(
      `chamado_lido_${id}`,
      new Date().toISOString()
    );
    navigate(`/chamados/${id}`);
  };

  /* =============================
     Estados globais
     ============================= */
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0d1117] text-gray-400" : "bg-gray-100 text-gray-600"}`}>
        Carregando seus chamados...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#0d1117] text-red-400" : "bg-gray-100 text-red-600"}`}>
        {error}
      </div>
    );
  }

  const listaOrdenada = ordenarChamados(chamados);

  return (
    <div className={`min-h-screen px-4 py-10 ${isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"}`}>
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-extrabold mb-8">
          📂 Meus Chamados
        </h1>

        {listaOrdenada.length === 0 ? (
          <div className={`p-6 rounded-xl border text-center ${isDark ? "bg-gray-900 border-gray-700 text-gray-400" : "bg-white border-gray-200 text-gray-600"}`}>
            Você ainda não abriu nenhum chamado.
          </div>
        ) : (
          <div className="space-y-4">
            {listaOrdenada.map((chamado) => {
              const naoLido = isNaoLido(chamado);

              return (
                <div
                  key={chamado.id}
                  onClick={() => abrirChamado(chamado.id)}
                  className={`
                    cursor-pointer rounded-2xl p-5 border transition
                    hover:scale-[1.01]
                    ${isDark
                      ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 hover:border-purple-500"
                      : "bg-white border-gray-200 hover:border-purple-400 shadow-sm"}
                  `}
                >
                  <div className="flex items-center justify-between gap-4">

                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {chamado.titulo}
                        {naoLido && (
                          <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Nova resposta
                          </span>
                        )}
                      </h3>

                      <p className={`${isDark ? "text-gray-400" : "text-gray-600"} text-sm`}>
                        {chamado.categoria}
                      </p>

                      <p className="text-sm text-purple-500 flex items-center gap-1">
                        <MessageCircle size={14} />
                        {infoTexto(chamado)}
                      </p>
                    </div>

                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-800 text-gray-200">
                      {chamado.status}
                    </span>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
