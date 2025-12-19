import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../utils/apiAxios";

export default function AbrirChamado() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [form, setForm] = useState({
    titulo: "",
    categoria: "",
    descricao: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.titulo || !form.categoria || !form.descricao) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/chamados", {
        titulo: form.titulo.trim(),
        categoria: form.categoria,
        descricao: form.descricao.trim(),
      });

      navigate("/meus-chamados");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Erro ao abrir chamado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        min-h-screen px-4 py-10 transition-colors duration-300
        ${isDark ? "bg-[#0d1117] text-gray-100" : "bg-gray-100 text-gray-900"}
      `}
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-2">
          🛠 Abrir Chamado
        </h1>

        <form
          onSubmit={handleSubmit}
          className={`
            rounded-2xl p-6 space-y-6 border transition-colors
            ${
              isDark
                ? "bg-gradient-to-b from-gray-900 to-black border-gray-700 shadow-lg"
                : "bg-white border-gray-200 shadow-md"
            }
          `}
        >
          {/* Título */}
          <div>
            <label className="block font-medium mb-1">
              Título do problema
            </label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ex: Não consigo acessar o sistema"
              className={`
                w-full p-2.5 rounded-lg outline-none transition
                ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500"
                    : "bg-gray-50 border border-gray-300 text-black focus:ring-2 focus:ring-purple-400"
                }
              `}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block font-medium mb-1">
              Categoria
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className={`
                w-full p-2.5 rounded-lg outline-none transition
                ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500"
                    : "bg-gray-50 border border-gray-300 text-black focus:ring-2 focus:ring-purple-400"
                }
              `}
            >
              <option value="">Selecione</option>
              <option value="Sistema">Sistema</option>
              <option value="Acesso">Acesso</option>
              <option value="Equipamento">Equipamento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block font-medium mb-1">
              Descrição
            </label>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              rows={5}
              placeholder="Descreva o problema com detalhes..."
              className={`
                w-full p-3 rounded-lg resize-none outline-none transition
                ${
                  isDark
                    ? "bg-gray-800 border border-gray-700 text-gray-100 focus:ring-2 focus:ring-purple-500"
                    : "bg-gray-50 border border-gray-300 text-black focus:ring-2 focus:ring-purple-400"
                }
              `}
            />
          </div>

          {/* Erro */}
          {error && (
            <p className="text-sm text-red-500 font-medium">{error}</p>
          )}

          {/* Ações */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate("/chamados")}
              className={`
                px-4 py-2 rounded-lg border transition
                ${
                  isDark
                    ? "border-gray-600 text-gray-200 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="
                px-6 py-2 rounded-lg
                bg-purple-600 hover:bg-purple-700
                text-white font-medium transition
                disabled:opacity-50
              "
            >
              {loading ? "Enviando..." : "Abrir Chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
