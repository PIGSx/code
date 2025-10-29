import React, { useState } from "react";
import { LogOut, Lock, User } from "lucide-react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");
  const [form, setForm] = useState({
    planilha_jjj_name: "",
    nomes_prazos_name: "",
    logradouro_name: "",
    output_file: "",
  });

  // URLs dinâmicas
  const AUTH_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5004"
      : "https://auth-api.onrender.com";

  const PENDENTE_URL =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5002"
      : "https://code-pendente.onrender.com";

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
      setError("Erro ao conectar com o servidor de autenticação.");
    }
  };

  // INPUTS DE FORM
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // PROCESSAR
  const handleProcess = async (e) => {
    e.preventDefault();
    setMessage("Processando...");

    try {
      const response = await fetch(`${PENDENTE_URL}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Processamento concluído.");
      } else {
        setMessage(data.error || "Erro ao processar os arquivos.");
      }
    } catch {
      setMessage("Erro ao conectar com o servidor de pendente.");
    }
  };

  // LOGOUT
  const handleLogout = () => {
    setLoggedIn(false);
    setToken("");
    setUsername("");
    setPassword("");
    setForm({
      planilha_jjj_name: "",
      nomes_prazos_name: "",
      logradouro_name: "",
      output_file: "",
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

            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}
            {message && (
              <p className="text-green-400 text-sm text-center mb-4">
                {message}
              </p>
            )}

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
                "planilha_jjj_name",
                "nomes_prazos_name",
                "logradouro_name",
                "output_file",
              ].map((field) => (
                <input
                  key={field}
                  type="text"
                  name={field}
                  placeholder={field.replace(/_/g, " ")}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-green-500 outline-none"
                />
              ))}

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
          </>
        )}
      </div>
    </div>
  );
}
