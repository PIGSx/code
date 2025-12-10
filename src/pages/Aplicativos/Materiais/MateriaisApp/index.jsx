import React, { useState } from "react";
import api from "../../../../utils/apiAxios";
import { getRole } from "../../../../utils/auth";

function MateriaisApp() {
  const role = getRole();
  const [kitsFile, setKitsFile] = useState(null);
  const [baixasFile, setBaixasFile] = useState(null);
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔵 ADICIONADO — controla se o app está em manutenção
  const emManutencao = true; 
  // coloque false para liberar o app

  if (!role) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-700 dark:text-gray-300">
        <p>Você precisa estar logado para acessar esta página.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kitsFile || !baixasFile) {
      alert("Por favor, envie os dois arquivos!");
      return;
    }

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
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Erro desconhecido ao processar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen py-10 px-4 flex flex-col items-center text-gray-900 dark:text-gray-100">

      {/* 🔵 OVERLAY DE MANUTENÇÃO — igual ao Pendente */}
      {emManutencao && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center 
          bg-black/70 backdrop-blur-md text-white text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Aplicativo em Manutenção</h1>
          <p className="text-lg max-w-xl">
            Estamos realizando atualizações importantes para melhorar sua experiência. 
            Por favor, tente novamente mais tarde.
          </p>
        </div>
      )}

      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 to-cyan-400 dark:from-blue-300 dark:to-cyan-200 bg-clip-text text-transparent">
        Processar Arquivos de Materiais
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700"
      >
        <div className="mb-4">
          <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
            Arquivo Kits
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setKitsFile(e.target.files[0])}
            className="w-full border border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-2 text-gray-800 dark:text-gray-200">
            Arquivo Baixas
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setBaixasFile(e.target.files[0])}
            className="w-full border border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-2 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50"
        >
          {loading ? "Processando..." : "Enviar"}
        </button>

        {error && (
          <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
        )}
      </form>

      {resultado.length > 0 && (
        <div className="mt-10 w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4">Resultado</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="border p-2">Número OS</th>
                  <th className="border p-2">TSE</th>
                  <th className="border p-2">Esperado</th>
                  <th className="border p-2">Lançado</th>
                  <th className="border p-2">Faltando</th>
                  <th className="border p-2">Extras</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>

              <tbody>
                {resultado.map((item, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <td className="border p-2">{item["Número OS"]}</td>
                    <td className="border p-2">{item.TSE}</td>
                    <td className="border p-2">{item.Esperado}</td>
                    <td className="border p-2">{item["Lançado"]}</td>
                    <td className="border p-2">{item.Faltando}</td>
                    <td className="border p-2">{item.Extras}</td>
                    <td
                      className={`border p-2 font-bold ${
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
