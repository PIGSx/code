import React, { useState } from "react";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    planilha_jjj_name: "",
    nomes_prazos_name: "",
    logradouro_name: "",
    output_file: "",
  });
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (data.success) {
        setLoggedIn(true);
        setError("");
      } else {
        setError(data.message || "Usuário ou senha inválidos.");
      }
    } catch {
      setError("Erro ao conectar no servidor.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://127.0.0.1:5000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage("Erro ao conectar no servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
            <h2 className="text-2xl font-bold text-center mb-6">Processar Arquivos</h2>
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
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
              >
                Processar
              </button>
            </form>
            {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
