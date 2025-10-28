import React, { useState } from "react";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    planilha_jjj_name: "",
    nomes_prazos_name: "",
    logradouro_name: "",
    output_file: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const AUTH_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5004" // auth.py local
      : "https://code-auth.onrender.com"; // auth.py deploy

  const PENDENTE_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://127.0.0.1:5002" // pendente.py local
      : "https://code-pendente.onrender.com"; // pendente.py deploy

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        setLoggedIn(true);
        setToken(data.token);
      } else {
        setError(data.message || "Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao conectar com o servidor de autenticação.");
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    setLoggedIn(false);
    setToken("");
    setUsername("");
    setPassword("");
    setMessage("");
  };

  // --- PROCESSAR ARQUIVO ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${PENDENTE_URL}/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setMessage(data.message || "Processamento concluído!");
    } catch (err) {
      console.error(err);
      setMessage("Erro ao conectar com o servidor de processamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        {!loggedIn ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Entrar
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Processar Arquivos</h2>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 underline hover:text-red-800"
              >
                Sair
              </button>
            </div>

            <form onSubmit={handleProcess} className="space-y-4">
              {["planilha_jjj_name", "nomes_prazos_name", "logradouro_name", "output_file"].map(
                (field) => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    placeholder={field.replace(/_/g, " ")}
                    value={form[field]}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring focus:ring-green-400"
                  />
                )
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-lg text-white transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {loading ? "Processando..." : "Processar"}
              </button>
            </form>

            {message && <p className="mt-4 text-center text-gray-700 font-medium">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
