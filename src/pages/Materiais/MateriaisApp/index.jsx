import React, { useState } from "react";

function Materiais() {
  const [kitsFile, setKitsFile] = useState(null);
  const [baixasFile, setBaixasFile] = useState(null);
  const [resultado, setResultado] = useState([]);
  const [loading, setLoading] = useState(false);

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
      const API_URL = "http://localhost:5000"; // Altere para a URL da sua API

      const response = await fetch(`${API_URL}/api/processar`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Erro ao enviar arquivos:", error);
      alert("Erro ao processar os arquivos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black py-10 px-4 text-gray-100 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold mb-8 text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
        Processar Arquivos
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800/90 backdrop-blur-sm shadow-lg rounded-xl p-6 w-full max-w-md border border-gray-700"
      >
        <div className="mb-4">
          <label className="block text-gray-300 font-medium mb-2">
            Arquivo Kits
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setKitsFile(e.target.files[0])}
            className="w-full border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 font-medium mb-2">
            Arquivo Baixas
          </label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setBaixasFile(e.target.files[0])}
            className="w-full border border-gray-600 bg-gray-900 text-gray-200 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Processando..." : "Enviar"}
        </button>
      </form>

      {resultado.length > 0 && (
        <div className="mt-10 w-full max-w-6xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Resultado</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-700 text-sm">
              <thead>
                <tr className="bg-gray-800">
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
                    className="hover:bg-gray-700 transition-colors duration-200"
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
                          ? "text-green-400"
                          : "text-red-500"
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

export default Materiais;
