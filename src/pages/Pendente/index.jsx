import React, { useState } from "react";
import { LogOut, Lock, User, Upload } from "lucide-react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    relatorio_fechados: null,
    planilha_prazos: null,
    pagina_guia: null,
    nome_do_relatorio: "",
  });

  const AUTH_URL = "http://127.0.0.1:5004";
  const PENDENTE_URL = "http://127.0.0.1:5002";

  // LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        setLoggedIn(true);
        setToken(data.token);
        setMessage(`Bem-vindo, ${data.user}!`);
      } else {
        setError(data.message || "Usuário ou senha inválidos.");
      }
    } catch {
      setError("Erro ao conectar com o servidor local (porta 5004).");
    }
  };

  // Muda texto ou arquivos
  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // PROCESSAR e baixar arquivo
  const handleProcess = async (e) => {
    e.preventDefault();
    setMessage("Enviando arquivos...");

    const formData = new FormData();
    if (form.relatorio_fechados) formData.append("relatorio_fechados", form.relatorio_fechados);
    if (form.planilha_prazos) formData.append("planilha_prazos", form.planilha_prazos);
    if (form.pagina_guia) formData.append("pagina_guia", form.pagina_guia);
    formData.append("nome_do_relatorio", form.nome_do_relatorio || "saida.xlsx");

    try {
      const response = await fetch(`${PENDENTE_URL}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setMessage(errorData.error || "Erro ao processar os arquivos.");
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", form.nome_do_relatorio || "saida.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage("Arquivo processado e baixado com sucesso!");
    } catch {
      setMessage("Erro ao conectar com o servidor local (porta 5002).");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setLoggedIn(false);
    setToken("");
    setUsername("");
    setPassword("");
    setForm({
      relatorio_fechados: null,
      planilha_prazos: null,
      pagina_guia: null,
      nome_do_relatorio: "",
    });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black flex items-center justify-center text-gray-100 px-4 py-10">
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-xl p-8">
        {!loggedIn ? (
          <>
            <h2 className="text-3xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Login
            </h2>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
            {message && <p className="text-green-400 text-sm text-center mb-4">{message}</p>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition-all text-white font-semibold py-2 rounded-lg"
              >
                Entrar
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent">
                Processar Arquivos
              </h2>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-400 hover:text-red-500 transition"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>

            <form onSubmit={handleProcess} className="space-y-4">
              {[
                { name: "relatorio_fechados", label: "Relatório Fechados" },
                { name: "planilha_prazos", label: "Planilha de Prazos" },
                { name: "pagina_guia", label: "Página Guia" },
              ].map(({ name, label }) => (
                <div key={name} className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1">{label}</label>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <input
                      type="file"
                      name={name}
                      onChange={handleChange}
                      className="text-sm text-gray-300 file:hidden focus:outline-none"
                    />
                  </div>
                </div>
              ))}

              <input
                type="text"
                name="nome_do_relatorio"
                placeholder="Nome do Relatório"
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

            {message && <p className="mt-4 text-center text-gray-400 animate-pulse">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
