// src/pages/Aplicativos/Pendente/index.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../../utils/apiAxios";
import {
  Upload,
  ChevronDown,
  ChevronUp,
  DownloadCloud,
  Save,
  AlertTriangle,
  Lock as LockIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../../context/ThemeContext";

export default function PendenteAPI() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const isBlocked = true;

  const [file, setFile] = useState(null);
  const [fileId, setFileId] = useState(null);
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [options, setOptions] = useState({});
  const [selectedContratos, setSelectedContratos] = useState([]);
  const [selectedAtcs, setSelectedAtcs] = useState([]);
  const [selectedDescricoes, setSelectedDescricoes] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [showTinyToast, setShowTinyToast] = useState(false);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToastOnce = (text, ms = 3500) => {
    setMessage(text);
    setShowTinyToast(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setShowTinyToast(false);
    }, ms);
  };

  const resetFilters = () => {
    setSelectedContratos([]);
    setSelectedAtcs([]);
    setSelectedDescricoes([]);
    setOptions({});
  };

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const toggleSelect = (list, setList, item) => {
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  };

  const uploadFile = async () => {
    if (!file) {
      showToastOnce("Selecione um arquivo primeiro.");
      return;
    }

    setLoading(true);
    setMessage("Enviando arquivo...");

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post("/pendente/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setFileId(res.data.file_id);
      setSheets(res.data.sheets || []);
      setSelectedSheet("");
      resetFilters();
      showToastOnce("Upload OK — escolha a aba");
    } catch (err) {
      console.error("uploadFile error:", err);
      setMessage("Erro no upload: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async (sheet) => {
    if (!fileId || !sheet) return;

    setLoading(true);
    setMessage("Carregando filtros...");

    try {
      const res = await api.get("/pendente/options", {
        params: { file_id: fileId, sheet }
      });

      setOptions(res.data || {});
      showToastOnce("Filtros carregados.");
    } catch (err) {
      console.error("fetchOptions error:", err);
      setMessage("Erro ao carregar filtros.");
    } finally {
      setLoading(false);
    }
  };

  const processFile = async () => {
    if (!fileId || !selectedSheet) {
      showToastOnce("Faça o upload e selecione a aba.");
      return;
    }

    setLoading(true);
    setMessage("Processando...");

    try {
      const fd = new FormData();
      fd.append("file_id", fileId);
      fd.append("sheet", selectedSheet);

      if (selectedContratos.length > 0) fd.append("contratos", JSON.stringify(selectedContratos));
      if (selectedAtcs.length > 0) fd.append("atcs", JSON.stringify(selectedAtcs));
      if (selectedDescricoes.length > 0) fd.append("descricoes", JSON.stringify(selectedDescricoes));

      const nome = "saida.xlsx";
      fd.append("nome_do_relatorio", nome);

      const res = await api.post("/pendente/process", fd, {
        responseType: "blob",
        headers: { "Content-Type": "multipart/form-data" }
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", nome);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToastOnce("Arquivo processado e baixado!");
    } catch (err) {
      console.error("processFile error:", err);
      setMessage("Erro ao processar: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async () => {
    try {
      const name = prompt("Nome do filtro:");
      if (!name) return;

      const payload = {
        name,
        contratos: selectedContratos,
        ATCs: selectedAtcs,
        "descrições_tss": selectedDescricoes
      };

      await api.post("/pendente/filters/save", payload);
      showToastOnce("Filtro salvo!");
    } catch (err) {
      console.error("saveFilter error:", err);
      setMessage("Erro ao salvar filtro.");
    }
  };

  const loadFilters = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pendente/filters/list");
      const filters = res.data.filters || [];

      if (!filters.length) {
        alert("Nenhum filtro salvo.");
        setLoading(false);
        return;
      }

      const list = filters.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
      const pick = prompt(`Filtros:\n\n${list}\n\nNúmero:`);
      const idx = Number(pick) - 1;
      if (!filters[idx]) {
        setLoading(false);
        return;
      }

      resetFilters();
      setSelectedContratos(filters[idx].contratos || []);
      setSelectedAtcs(filters[idx].ATCs || []);
      setSelectedDescricoes(filters[idx]["descrições_tss"] || []);

      showToastOnce("Filtro aplicado.");
    } catch (err) {
      console.error("loadFilters error:", err);
      setMessage("Erro ao carregar filtros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`
        p-4 sm:p-6 max-w-6xl mx-auto 
        bg-white dark:bg-[#0d1117]
        text-black dark:text-gray-100
        transition-colors duration-300 rounded-xl
      `}
    >
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
        className={`
          rounded-xl shadow-lg p-4 sm:p-6
          ${isDark
            ? "bg-gradient-to-b from-gray-900 to-black text-gray-100"
            : "bg-white text-black"}
          transition-colors duration-300
        `}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Processar Pendentes</h1>
            <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mt-1`}>
              Envie a planilha, selecione filtros e baixe o resultado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`${isDark ? "hover:bg-gray-800" : "hover:bg-gray-200"} p-2 rounded`}
            >
              {filtersOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
          </div>
        </div>

        <div className="relative mt-4">
          <div className={`${isBlocked ? "pointer-events-none" : ""} transition-opacity duration-200`}>
            <div>
              <label
                className={`${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"} block rounded p-3 cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <Upload size={18} />
                  <span className="truncate">{file ? file.name : "Escolher arquivo (.xlsx)"}</span>
                </div>
                <input type="file" className="hidden" onChange={onFileChange} />
              </label>

              <div className="flex gap-3 mt-3">
                <button onClick={uploadFile} disabled={loading} className="btn-primary">
                  Enviar
                </button>

                <button
                  onClick={() => {
                    setFile(null);
                    setFileId(null);
                    setSheets([]);
                    resetFilters();
                    setMessage("");
                  }}
                  className="btn-secondary"
                >
                  Limpar
                </button>
              </div>
            </div>

            {sheets.length > 0 && (
              <div className="mt-4">
                <select
                  value={selectedSheet}
                  onChange={(e) => {
                    setSelectedSheet(e.target.value);
                    resetFilters();
                    fetchOptions(e.target.value);
                  }}
                  className={`${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"} p-2 rounded w-full`}
                >
                  <option value="">-- Escolher aba --</option>
                  {sheets.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FilterCard
                      title="Contratos"
                      items={options["Contrato"] || []}
                      selected={selectedContratos}
                      toggle={(v) => toggleSelect(selectedContratos, setSelectedContratos, v)}
                      isDark={isDark}
                    />

                    <FilterCard
                      title="ATC"
                      items={options["ATC"] || []}
                      selected={selectedAtcs}
                      toggle={(v) => toggleSelect(selectedAtcs, setSelectedAtcs, v)}
                      isDark={isDark}
                    />

                    <FilterCard
                      title="Descrição TSS"
                      items={options["Descrição TSS"] || []}
                      selected={selectedDescricoes}
                      toggle={(v) => toggleSelect(selectedDescricoes, setSelectedDescricoes, v)}
                      isDark={isDark}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                onClick={processFile}
                disabled={loading}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <DownloadCloud size={18} />
                {loading ? "Processando..." : "Processar e Baixar"}
              </button>

              <button onClick={saveFilter} className="btn-warning flex items-center gap-2">
                <Save size={16} /> Salvar
              </button>

              <button onClick={loadFilters} className="btn-info flex items-center gap-2">
                <DownloadCloud size={16} /> Carregar
              </button>
            </div>

            <p className={`${isDark ? "text-gray-300" : "text-gray-600"} text-sm mt-4`}>
              {message}
            </p>
          </div>

          {isBlocked && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="absolute inset-0 backdrop-blur-[3px] bg-black/30 rounded-lg" />
              <div className="relative z-30 px-6 py-6 max-w-xl text-center">
                <div className="flex justify-center mb-4">
                  <LockIcon size={44} className="text-white/95" />
                </div>
                <h2 className="text-white text-2xl font-semibold mb-2">Aplicativo em manutenção</h2>
                <p className="text-gray-200">Por favor, tente mais tarde.</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showTinyToast && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className={`fixed right-6 bottom-6 z-50 px-4 py-2 rounded-lg shadow-lg ${
              isDark ? "bg-gray-800 text-gray-100" : "bg-white text-black"
            }`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterCard({ title, items = [], selected = [], toggle, isDark }) {
  return (
    <div
      className={`${isDark ? "bg-gray-800 border border-gray-700" : "bg-gray-100 border border-gray-300"} rounded p-3`}
    >
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="max-h-48 overflow-auto space-y-1">
        {items.length === 0 && (
          <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-sm`}>Nenhum valor.</p>
        )}
        {items.map((it) => (
          <label key={it} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(it)}
              onChange={() => toggle(it)}
            />
            <span className="truncate">{it}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
