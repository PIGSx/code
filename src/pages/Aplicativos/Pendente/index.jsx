// PendenteAPI.jsx — Versão FINAL compatível com tema escuro global
import React, { useState } from "react";
import api from "../../../utils/apiAxios";
import { Upload, ChevronDown, ChevronUp, DownloadCloud, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PendenteAPI() {
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

  // ========================= UPLOAD =========================
  const uploadFile = async () => {
    if (!file) return setMessage("Selecione um arquivo primeiro.");
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

      setMessage("Upload OK — escolha a aba");
    } catch (err) {
      console.error(err);
      setMessage("Erro no upload: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ========================= CARREGAR OPÇÕES =========================
  const fetchOptions = async (sheet) => {
    if (!fileId || !sheet) return;

    setLoading(true);
    setMessage("Carregando filtros...");

    try {
      const res = await api.get("/pendente/options", {
        params: { file_id: fileId, sheet }
      });

      setOptions(res.data || {});
      setMessage("Filtros carregados.");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar filtros.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (list, setList, item) => {
    setList(
      list.includes(item)
        ? list.filter((x) => x !== item)
        : [...list, item]
    );
  };

  // ========================= PROCESSAR =========================
  const processFile = async () => {
    if (!fileId || !selectedSheet)
      return setMessage("Faça o upload e selecione a aba.");

    setLoading(true);
    setMessage("Processando...");

    try {
      const fd = new FormData();
      fd.append("file_id", fileId);
      fd.append("sheet", selectedSheet);

      if (selectedContratos.length > 0)
        fd.append("contratos", JSON.stringify(selectedContratos));

      if (selectedAtcs.length > 0)
        fd.append("atcs", JSON.stringify(selectedAtcs));

      if (selectedDescricoes.length > 0)
        fd.append("descricoes", JSON.stringify(selectedDescricoes));

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

      setMessage("Arquivo processado e baixado!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao processar: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // ========================= SALVAR FILTRO =========================
  const saveFilter = async () => {
    const name = prompt("Nome do filtro:");
    if (!name) return;

    const payload = {
      name,
      contratos: selectedContratos,
      ATCs: selectedAtcs,
      "descrições_tss": selectedDescricoes,
    };

    try {
      await api.post("/pendente/filters/save", payload);
      setMessage("Filtro salvo!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao salvar filtro.");
    }
  };

  // ========================= CARREGAR FILTRO =========================
  const loadFilters = async () => {
    setLoading(true);
    try {
      const res = await api.get("/pendente/filters/list");
      const filters = res.data.filters || [];

      if (!filters.length) return alert("Nenhum filtro salvo.");

      const list = filters.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
      const pick = prompt(`Filtros:\n\n${list}\n\nNúmero:`);

      const idx = Number(pick) - 1;
      if (!filters[idx]) return;

      resetFilters();
      setSelectedContratos(filters[idx].contratos || []);
      setSelectedAtcs(filters[idx].ATCs || []);
      setSelectedDescricoes(filters[idx]["descrições_tss"] || []);

      setMessage("Filtro aplicado.");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao carregar filtros.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card text-card-foreground rounded-xl shadow-lg p-4 sm:p-6"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Processar Pendentes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Envie a planilha, selecione filtros e baixe o resultado.
            </p>
          </div>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="p-2 rounded hover:bg-accent"
          >
            {filtersOpen ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {/* UPLOAD */}
        <div className="mt-4">
          <label className="block bg-secondary border border-border rounded p-3 cursor-pointer">
            <div className="flex items-center gap-2">
              <Upload size={18} />
              <span className="truncate">
                {file ? file.name : "Escolher arquivo (.xlsx)"}
              </span>
            </div>
            <input type="file" className="hidden" onChange={onFileChange} />
          </label>

          <div className="flex gap-3 mt-3">
            <button
              onClick={uploadFile}
              disabled={loading}
              className="btn-primary"
            >
              Enviar
            </button>

            <button
              onClick={() => {
                setFile(null);
                setFileId(null);
                setSheets([]);
                resetFilters();
              }}
              className="btn-secondary"
            >
              Limpar
            </button>
          </div>
        </div>

        {/* SHEETS */}
        {sheets.length > 0 && (
          <div className="mt-4">
            <select
              value={selectedSheet}
              onChange={(e) => {
                setSelectedSheet(e.target.value);
                resetFilters();
                fetchOptions(e.target.value);
              }}
              className="bg-secondary p-2 rounded w-full"
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

        {/* FILTERS */}
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
                />

                <FilterCard
                  title="ATC"
                  items={options["ATC"] || []}
                  selected={selectedAtcs}
                  toggle={(v) => toggleSelect(selectedAtcs, setSelectedAtcs, v)}
                />

                <FilterCard
                  title="Descrição TSS"
                  items={options["Descrição TSS"] || []}
                  selected={selectedDescricoes}
                  toggle={(v) => toggleSelect(selectedDescricoes, setSelectedDescricoes, v)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION BUTTONS */}
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

        <p className="text-muted-foreground text-sm mt-4">{message}</p>
      </motion.div>
    </div>
  );
}

function FilterCard({ title, items = [], selected = [], toggle }) {
  return (
    <div className="bg-secondary border border-border rounded p-3">
      <h4 className="font-semibold mb-2">{title}</h4>
      <div className="max-h-48 overflow-auto space-y-1">
        {items.length === 0 && (
          <p className="text-muted-foreground text-sm">Nenhum valor.</p>
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
