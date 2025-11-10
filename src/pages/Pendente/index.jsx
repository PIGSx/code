import React, { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { getToken } from "../../utils/auth";
import api from "../../utils/apiAxios";

export default function Pendente() {
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    relatorio_fechados: null,
    planilha_prazos: null,
    pagina_guia: null,
    nome_do_relatorio: "",
  });

  const token = getToken();

  // Se não tiver token, redireciona para login
  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, [token]);

  // --- INPUTS ---
  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // --- PROCESSAR ---
  const handleProcess = async (e) => {
    e.preventDefault();
    setMessage("⏳ Enviando arquivos...");

    if (!form.relatorio_fechados)
      return setMessage("⚠️ Envie o arquivo principal.");

    const formData = new FormData();
    formData.append("relatorio_fechados", form.relatorio_fechados);
    if (form.planilha_prazos)
      formData.append("planilha_prazos", form.planilha_prazos);
    if (form.pagina_guia) formData.append("pagina_guia", form.pagina_guia);

    // ✅ Garante extensão .xlsx
    let nomeArquivo = form.nome_do_relatorio?.trim() || "saida";
    if (!nomeArquivo.toLowerCase().endsWith(".xlsx")) {
      nomeArquivo += ".xlsx";
    }
    formData.append("nome_do_relatorio", nomeArquivo);

    try {
      const res = await api.post("/pendente/processar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      if (res.status !== 200) {
        setMessage("❌ Erro ao processar arquivos.");
        return;
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", nomeArquivo);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage("✅ Arquivo processado e baixado com sucesso!");
    } catch (err) {
      console.error("❌ Erro no processamento:", err);
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Verifique sua conexão."
          : "Erro ao conectar com o servidor.");
      setMessage(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center text-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent">
          Processar Arquivos
        </h2>

        <form onSubmit={handleProcess} className="space-y-4">
          {["relatorio_pendente", "planilha_prazos", "pagina_guia"].map(
            (key, i) => (
              <div key={i} className="flex flex-col">
                <label className="text-sm text-gray-400 mb-1 capitalize">
                  {key.replace("_", " ")}
                </label>
                <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <input
                    type="file"
                    name={key}
                    onChange={handleChange}
                    className="text-sm text-gray-300 file:hidden focus:outline-none"
                  />
                </div>
              </div>
            )
          )}

          <input
            type="text"
            name="nome_do_relatorio"
            placeholder="Nome do Relatório (ex: pendentes_nov)"
            value={form.nome_do_relatorio}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-green-500 outline-none"
          />

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-all text-white font-semibold py-2 rounded-lg"
          >
            Processar
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-gray-400 animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
