import { useState } from "react";
import api from "./../../../utils/apiAxios";
import { motion } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";
import { Upload, Filter, Download } from "lucide-react";

export default function Pendente() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState(null);

  const [options, setOptions] = useState({
    contratos: [],
    atcs: [],
    familias: [],
    descricoes: [],
  });

  const [filtros, setFiltros] = useState({
    contratos: [],
    atcs: [],
    familias: [],
    descricoes: [],
  });

  // ===============================
  // UPLOAD
  // ===============================
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/pendente/upload", form);

      setFileId(res.data.file_id);
      setOptions({
        contratos: res.data.contratos || [],
        atcs: res.data.atcs || [],
        familias: res.data.familias || [],
        descricoes: res.data.descricoes || [],
      });

      setFiltros({
        contratos: [],
        atcs: [],
        familias: [],
        descricoes: [],
      });
    } catch {
      alert("Erro no upload da planilha");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TOGGLE
  // ===============================
  const toggle = (tipo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [tipo]: prev[tipo].includes(valor)
        ? prev[tipo].filter((v) => v !== valor)
        : [...prev[tipo], valor],
    }));
  };

  // ===============================
  // APLICAR FILTROS
  // ===============================
  const aplicarFiltro = async () => {
    try {
      setLoading(true);
      await api.post("/pendente/filter", {
        file_id: fileId,
        filtros,
      });
    } catch {
      alert("Erro ao aplicar filtros");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DOWNLOAD
  // ===============================
  const baixar = async () => {
    try {
      setLoading(true);
      const res = await api.post(
        "/pendente/format",
        { file_id: fileId },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "pendente.xlsx";
      a.click();
    } catch {
      alert("Erro ao gerar planilha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* LOADING */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* TÍTULO */}
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold mb-10"
      >
        📄 Pendente
      </motion.h1>

      {/* UPLOAD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 shadow-xl border ${
          theme === "dark"
            ? "bg-gray-800/60 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <label className="flex items-center gap-4 cursor-pointer">
          <Upload className="w-6 h-6 opacity-80" />
          <span className="font-semibold">Selecionar planilha</span>
          <input type="file" onChange={upload} className="hidden" />
        </label>
      </motion.div>

      {/* FILTROS */}
      {fileId && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {[
            ["contratos", "Contratos"],
            ["atcs", "ATCs"],
            ["familias", "Famílias"],
            ["descricoes", "Descrição TSS"],
          ].map(([key, label], i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-3xl p-6 shadow-xl border ${
                theme === "dark"
                  ? "bg-gray-800/60 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h2 className="font-bold mb-4">{label}</h2>

              <div className="max-h-56 overflow-auto space-y-2 text-sm">
                {(options[key] || []).length === 0 && (
                  <p className="text-gray-400 text-center text-sm">
                    Nenhum item
                  </p>
                )}

                {(options[key] || []).map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80"
                  >
                    <input
                      type="checkbox"
                      checked={filtros[key].includes(item)}
                      onChange={() => toggle(key, item)}
                      className="accent-violet-500"
                    />
                    <span className="truncate">{item}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* AÇÕES */}
      {fileId && (
        <div className="flex flex-wrap gap-6 mt-12">
          <button
            onClick={aplicarFiltro}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold
              bg-gradient-to-r from-indigo-500 to-violet-600 text-white
              hover:scale-105 transition-all shadow-lg"
          >
            <Filter className="w-5 h-5" />
            Aplicar Filtros
          </button>

          <button
            onClick={baixar}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl font-semibold
              bg-gradient-to-r from-emerald-500 to-green-600 text-white
              hover:scale-105 transition-all shadow-lg"
          >
            <Download className="w-5 h-5" />
            Gerar Planilha
          </button>
        </div>
      )}
    </div>
  );
}
