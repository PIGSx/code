import { useState } from "react";
import api from "./../../../utils/apiAxios";

export default function Pendente() {
  const [loading, setLoading] = useState(false);

  const [fileId, setFileId] = useState(null);
  const [filename, setFilename] = useState("");
  const [sheets, setSheets] = useState([]);
  const [sheet, setSheet] = useState("");

  const [options, setOptions] = useState({
    contratos: [],
    atcs: [],
    descricoes: [],
  });

  const [contratos, setContratos] = useState([]);
  const [atcs, setAtcs] = useState([]);
  const [descricoes, setDescricoes] = useState([]);

  // ===============================
  // UPLOAD
  // ===============================
  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/pendente/upload", form);

      setFileId(res.data.file_id);
      setFilename(res.data.filename);
      setSheets(res.data.sheets);
      setSheet("");
    } catch (err) {
      console.error(err);
      alert("Erro no upload");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // CARREGAR OPÇÕES
  // ===============================
  const carregarOpcoes = async (sheetName) => {
    try {
      setLoading(true);

      const res = await api.get("/pendente/options", {
        params: { file_id: fileId, sheet: sheetName },
      });

      setOptions(res.data);
      setContratos([]);
      setAtcs([]);
      setDescricoes([]);
    } catch (err) {
      console.error(err);
      alert("Erro ao carregar opções");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // TOGGLE
  // ===============================
  const toggle = (value, list, setList) => {
    setList(
      list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value]
    );
  };

  // ===============================
  // PROCESSAR / DOWNLOAD
  // ===============================
  const processar = async () => {
    try {
      setLoading(true);

      const form = new FormData();
      form.append("file_id", fileId);
      form.append("sheet", sheet);
      form.append("contratos", JSON.stringify(contratos));
      form.append("atcs", JSON.stringify(atcs));
      form.append("descricoes", JSON.stringify(descricoes));
      form.append("nome_do_relatorio", "pendente.xlsx");

      const res = await api.post("/pendente/process", form, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "pendente.xlsx";
      link.click();
    } catch (err) {
      console.error(err);
      alert("Erro ao processar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative">
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      <h1 className="text-2xl font-bold">Pendente</h1>

      <input type="file" onChange={upload} />

      {sheets.length > 0 && (
        <select
          className="border p-2"
          value={sheet}
          onChange={(e) => {
            setSheet(e.target.value);
            carregarOpcoes(e.target.value);
          }}
        >
          <option value="">Selecione a aba</option>
          {sheets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {sheet && (
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Contratos", options.contratos, contratos, setContratos],
            ["ATCs", options.atcs, atcs, setAtcs],
            ["Descrição TSS", options.descricoes, descricoes, setDescricoes],
          ].map(([titulo, itens, estado, setter]) => (
            <div key={titulo} className="border p-3 rounded">
              <h2 className="font-semibold mb-2">{titulo}</h2>
              <div className="max-h-48 overflow-auto space-y-1">
                {itens.map((i) => (
                  <label key={i} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={estado.includes(i)}
                      onChange={() => toggle(i, estado, setter)}
                    />
                    {i}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {sheet && (
        <button
          onClick={processar}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Gerar Planilha
        </button>
      )}
    </div>
  );
}
