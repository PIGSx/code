import React, { useState } from "react";
import api from "../../../../utils/apiAxios";
import { getRole } from "../../../../utils/auth";
import { useTheme } from "../../../../context/ThemeContext";

function MateriaisApp() {
  const role = getRole();
  const { theme } = useTheme();

  const [kitsFile, setKitsFile] = useState(null);
  const [baixasFile, setBaixasFile] = useState(null);
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔵 CONTROLE DE MANUTENÇÃO
  const emManutencao = true;

  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600 dark:text-gray-300">
        Você precisa estar logado para acessar esta página.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kitsFile || !baixasFile) return alert("Envie os dois arquivos.");

    const formData = new FormData();
    formData.append("kits", kitsFile);
    formData.append("baixas", baixasFile);

    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/processar_materiais", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultado(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Erro ao processar."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 flex flex-col items-center">

      {/* OVERLAY MANUTENÇÃO */}
      {emManutencao && (
        <div className="absolute inset-0 z-50 flex items-center justify-center 
          bg-black/70 backdrop-blur-md text-white text-center px-6">
          <div>
            <h1 className="text-4xl font-bold mb-4">Aplicativo em Manutenção</h1>
            <p className="max-w-xl text-lg">
              Estamos realizando melhorias. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      )}

      {/* TÍTULO */}
      <h1 className="text-3xl font-extrabold mb-10
        bg-gradient-to-r from-blue-400 to-cyan-300
        bg-clip-text text-transparent">
        Processar Materiais
      </h1>

      {/* FORMULÁRIO */}
      <form
        onSubmit={handleSubmit}
        className={`
          w-full max-w-md p-6 rounded-2xl border shadow-lg
          ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
      >
        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
            Arquivo Kits
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setKitsFile(e.target.files[0])}
            className={`
              w-full p-2 rounded-lg border transition
              ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-600 text-gray-200"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }
            `}
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-200">
            Arquivo Baixas
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setBaixasFile(e.target.files[0])}
            className={`
              w-full p-2 rounded-lg border transition
              ${
                theme === "dark"
                  ? "bg-gray-900 border-gray-600 text-gray-200"
                  : "bg-gray-50 border-gray-300 text-gray-900"
              }
            `}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg text-white font-medium
            bg-blue-600 hover:bg-blue-700 transition
            disabled:opacity-50"
        >
          {loading ? "Processando..." : "Enviar Arquivos"}
        </button>

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </form>

      {/* RESULTADO */}
      {resultado.length > 0 && (
        <div className="mt-12 w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4">Resultado</h2>

          <div
            className={`
              overflow-x-auto rounded-xl border
              ${
                theme === "dark"
                  ? "border-gray-700"
                  : "border-gray-200"
              }
            `}
          >
            <table className="w-full text-sm border-collapse">
              <thead
                className={
                  theme === "dark"
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-100 text-gray-700"
                }
              >
                <tr>
                  {[
                    "Número OS",
                    "TSE",
                    "Esperado",
                    "Lançado",
                    "Faltando",
                    "Extras",
                    "Status",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {resultado.map((item, idx) => (
                  <tr
                    key={idx}
                    className={
                      theme === "dark"
                        ? "hover:bg-gray-800"
                        : "hover:bg-blue-50"
                    }
                  >
                    {[
                      item["Número OS"],
                      item.TSE,
                      item.Esperado,
                      item["Lançado"],
                      item.Faltando,
                      item.Extras,
                    ].map((val, i) => (
                      <td key={i} className="px-4 py-3 border-t">
                        {val}
                      </td>
                    ))}

                    <td
                      className={`px-4 py-3 border-t font-semibold ${
                        item.Status === "OK"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.Status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>  
        </div>
      )}
    </div>
  );
}

export default MateriaisApp;
