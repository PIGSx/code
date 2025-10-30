// src/pages/Login/index.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../../utils/auth";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    clearAuth(); // limpa login anterior

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        console.log("✅ Login OK:", data);

        // Salva token e dados do usuário
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user);
        localStorage.setItem("role", data.role);

        // Redireciona e força o recarregamento da Navbar
        navigate("/");
        window.location.reload(); // 🔹 garante que a Navbar veja o novo token
      } else {
        setError(data.message || "Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Erro ao conectar com o servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 flex flex-col space-y-4"
      >
        <h1 className="text-2xl font-semibold text-center text-blue-600">
          Login
        </h1>

        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
