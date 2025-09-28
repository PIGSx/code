import React, { useState, useRef } from "react";

export default function App() {
  // --- ESTADOS DE LOGIN ---
  const [user, setUser] = useState("");
  const [passw, setPassw] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- ESTADOS DOS ARQUIVOS ---
  const [fileJJJ, setFileJJJ] = useState(null);
  const [filePrazos, setFilePrazos] = useState(null);
  const [fileLogradouro, setFileLogradouro] = useState(null);

  // --- CONTROLE DE STATUS ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // --- REFS para limpar os <input type="file"> visualmente ---
  const fileJJJRef = useRef();
  const filePrazosRef = useRef();
  const fileLogradouroRef = useRef();

  // --- LOGIN DEMO ---
  const allowed = { jaya: "697843" };

  // --- FUNÇÃO LOGIN ---
  function handleLogin(e) {
    e.preventDefault();
    if (allowed[user] && allowed[user] === passw) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Usuário ou senha inválidos.");
    }
  }

  // --- FUNÇÃO PROCESSAR ---
  async function handleProcess(e) {
    e.preventDefault();
    setError("");
    setDownloadUrl("");

    // Checa se os três arquivos estão presentes
    if (!fileJJJ || !filePrazos || !fileLogradouro) {
      setError("Por favor selecione as três planilhas.");
      return;
    }

    // Cria formData e adiciona arquivos
    const formData = new FormData();
    formData.append("planilha_jjj", fileJJJ);
    formData.append("nomes_prazos", filePrazos);
    formData.append("logradouro", fileLogradouro);

    try {
      setLoading(true);

      // POST para seu backend Flask/FastAPI
      const resp = await fetch("http://localhost:8000/processar", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Erro do servidor: ${resp.status} - ${txt}`);
      }

      // Converte resposta em blob Excel
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setError("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  // --- FUNÇÃO LOGOUT ---
  function logout() {
    setIsAuthenticated(false);
    setUser("");
    setPassw("");
    handleClear(); // também limpa arquivos
  }

  // --- FUNÇÃO LIMPAR INPUTS E STATES ---
  function handleClear() {
    // zera states
    setFileJJJ(null);
    setFilePrazos(null);
    setFileLogradouro(null);
    setDownloadUrl("");
    setError("");

    // zera campos de arquivo visualmente
    if (fileJJJRef.current) fileJJJRef.current.value = "";
    if (filePrazosRef.current) filePrazosRef.current.value = "";
    if (fileLogradouroRef.current) fileLogradouroRef.current.value = "";
  }

  // --- JSX ---
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        {!isAuthenticated ? (
          // --- FORMULÁRIO DE LOGIN ---
          <form onSubmit={handleLogin} className="space-y-4">
            <h1 className="text-2xl font-semibold">Login</h1>
            {error && <div className="text-red-600">{error}</div>}
            <div>
              <label className="block text-sm">Usuário</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm">Senha</label>
              <input
                type="password"
                className="mt-1 w-full border rounded px-3 py-2"
                value={passw}
                onChange={(e) => setPassw(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white"
                type="submit"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setUser("");
                  setPassw("");
                }}
                className="px-3 py-2 border rounded"
              >
                Limpar
              </button>
            </div>
            <div className="text-sm text-gray-500">
              Credenciais demo: <strong>jaya / 697843</strong>
            </div>
          </form>
        ) : (
          // --- ÁREA PRINCIPAL APÓS LOGIN ---
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Processador de Planilhas</h1>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">{`Logado como ${user}`}</div>
                <button
                  onClick={logout}
                  className="px-3 py-2 border rounded"
                >
                  Sair
                </button>
              </div>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            {/* FORM DE UPLOAD */}
            <form onSubmit={handleProcess} className="space-y-3">
              <div>
                <label className="block text-sm">Planilha Principal</label>
                <input
                  ref={fileJJJRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFileJJJ(e.target.files[0])}
                />
              </div>

              <div>
                <label className="block text-sm">Planilha de Prazos</label>
                <input
                  ref={filePrazosRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFilePrazos(e.target.files[0])}
                />
              </div>

              <div>
                <label className="block text-sm">Planilha de Logradouro</label>
                <input
                  ref={fileLogradouroRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFileLogradouro(e.target.files[0])}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  {loading ? "Processando..." : "Iniciar Processo"}
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 border rounded"
                >
                  Limpar
                </button>
              </div>
            </form>

            {loading && (
              <div className="text-sm text-gray-600">
                Aguarde — processando no servidor...
              </div>
            )}

            {/* LINK PARA BAIXAR */}
            {downloadUrl && (
              <div className="mt-4">
                <a
                  href={downloadUrl}
                  download="resultado.xlsx"
                  className="px-4 py-2 rounded bg-blue-600 text-white"
                >
                  Baixar resultado.xlsx
                </a>
              </div>
            )}

            <div className="text-xs text-gray-400">
              Observação: este front faz upload para http://localhost:8000/processar
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
