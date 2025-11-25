import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, setAuth } from "../../utils/auth";  // <-- IMPORTANTE
import { User, Lock } from "lucide-react";
import api from "../../utils/apiAxios";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Preencha usuário e senha.");
      return;
    }

    clearAuth();
    setLoading(true);

    try {
      const res = await api.post("/login", { username, password });

      if (res.data?.success && res.data?.token) {
        // ⬇️ AQUI É O PONTO CRÍTICO — usando setAuth CERTINHO
        setAuth(
          res.data.token,
          res.data.username || res.data.user || username, 
          res.data.role || "user",  
          8 // horas até expirar
        );

        navigate("/", { replace: true });
      } else {
        setError(res.data?.message || "Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Tente novamente."
          : "Erro ao conectar com o servidor.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-950 to-black px-4">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900/70 backdrop-blur-lg p-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6 border border-gray-800"
      >
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Login
        </h1>

        {/* Usuário */}
        <div className="relative">
          <User className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* Senha */}
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-10 py-2 text-gray-200 placeholder-gray-500 focus:ring focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg shadow-md transition disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
