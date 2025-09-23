/*
React frontend (single-file) to match the FastAPI backend you asked for.

How to use:
1) Create a new Vite React app (recommended):
   npm create vite@latest frontend -- --template react
   cd frontend
   npm install

2) Replace src/App.jsx with the contents of this file.
   (Or paste into a new component and import it in src/main.jsx)

3) Install dependencies (none required for this file). If using Tailwind, set it up separately.

4) Run the dev server:
   npm run dev

This component implements:
- Simple login (client-side) using the same credential from your Python: jaya / 697843
- File inputs for the three spreadsheets
- POST to http://localhost:8000/processar (multipart/form-data)
- Shows processing state and enables download of returned Excel

Note: For production, move authentication to the backend and secure CORS.
*/

import React, { useState } from "react";

export default function App() {
  const [user, setUser] = useState("");
  const [passw, setPassw] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [fileJJJ, setFileJJJ] = useState(null);
  const [filePrazos, setFilePrazos] = useState(null);
  const [fileLogradouro, setFileLogradouro] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  // Client-side credentials (temporary) — same as your script
  const allowed = { jaya: "697843" };

  function handleLogin(e) {
    e.preventDefault();
    if (allowed[user] && allowed[user] === passw) {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Usuário ou senha inválidos.");
    }
  }

  async function handleProcess(e) {
    e.preventDefault();
    setError("");
    setDownloadUrl("");

    if (!fileJJJ || !filePrazos || !fileLogradouro) {
      setError("Por favor selecione as três planilhas.");
      return;
    }

    const formData = new FormData();
    formData.append("planilha_jjj", fileJJJ);
    formData.append("nomes_prazos", filePrazos);
    formData.append("logradouro", fileLogradouro);

    try {
      setLoading(true);

      const resp = await fetch("http://localhost:8000/processar", {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Erro do servidor: ${resp.status} - ${txt}`);
      }

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

  function logout() {
    setIsAuthenticated(false);
    setUser("");
    setPassw("");
    setFileJJJ(null);
    setFilePrazos(null);
    setFileLogradouro(null);
    setDownloadUrl("");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-6">
        {!isAuthenticated ? (
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
              <button className="px-4 py-2 rounded bg-blue-600 text-white" type="submit">Entrar</button>
              <button type="button" onClick={() => { setUser(''); setPassw(''); }} className="px-3 py-2 border rounded">Limpar</button>
            </div>
            <div className="text-sm text-gray-500">Credenciais demo: <strong>jaya / 697843</strong></div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold">Processador de Planilhas</h1>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600">{`Logado como ${user}`}</div>
                <button onClick={logout} className="px-3 py-2 border rounded">Sair</button>
              </div>
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <form onSubmit={handleProcess} className="space-y-3">
              <div>
                <label className="block text-sm">Planilha Principal</label>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setFileJJJ(e.target.files[0])} />
              </div>

              <div>
                <label className="block text-sm">Planilha de Prazos</label>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setFilePrazos(e.target.files[0])} />
              </div>

              <div>
                <label className="block text-sm">Planilha de Logradouro</label>
                <input type="file" accept=".xlsx,.xls" onChange={(e) => setFileLogradouro(e.target.files[0])} />
              </div>

              <div className="flex items-center gap-3">
                <button disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded">{loading ? 'Processando...' : 'Iniciar Processo'}</button>
                <button type="button" onClick={() => { setFileJJJ(null); setFilePrazos(null); setFileLogradouro(null); setDownloadUrl(''); }} className="px-3 py-2 border rounded">Limpar</button>
              </div>
            </form>

            {loading && <div className="text-sm text-gray-600">Aguarde — processando no servidor...</div>}

            {downloadUrl && (
              <div className="mt-4">
                <a href={downloadUrl} download="resultado.xlsx" className="px-4 py-2 rounded bg-blue-600 text-white">Baixar resultado.xlsx</a>
              </div>
            )}

            <div className="text-xs text-gray-400">Observação: este front faz upload para http://localhost:8000/processar</div>
          </div>
        )}
      </div>
    </div>
  );
}
