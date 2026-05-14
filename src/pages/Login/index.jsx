import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, setAuth } from "../../utils/auth";
import { User, Lock, ShieldCheck, Loader2 } from "lucide-react";
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
        setAuth(
          res.data.token,
          res.data.username || res.data.user || username,
          res.data.role || "user",
          8
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-4 py-10 text-white">
      {/* Background minimalista */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        {/* Marca */}
        <div className="mb-8 text-center">

          <h1 className="text-2xl font-black tracking-tight">
            TECHNOBLADE
          </h1>

        </div>

        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="
            rounded-[2rem] border border-white/10
            bg-white/[0.04] p-6 shadow-2xl
            backdrop-blur-2xl
            sm:p-8
          "
        >
          <div className="mb-7">
            <p className="text-sm font-bold text-cyan-300">
              Acesso restrito
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Informe suas credenciais para acessar o ambiente corporativo.
            </p>
          </div>

          <div className="space-y-4">
            {/* Usuário */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Usuário
              </label>

              <div className="relative">
                <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  type="text"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="
                    w-full rounded-2xl border border-white/10
                    bg-white/[0.06] px-12 py-3
                    text-white placeholder-slate-500
                    outline-none transition
                    focus:border-cyan-400/50
                    focus:bg-white/[0.08]
                    focus:ring-4 focus:ring-cyan-400/10
                  "
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-300">
                Senha
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                <input
                  type="password"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="
                    w-full rounded-2xl border border-white/10
                    bg-white/[0.06] px-12 py-3
                    text-white placeholder-slate-500
                    outline-none transition
                    focus:border-cyan-400/50
                    focus:bg-white/[0.08]
                    focus:ring-4 focus:ring-cyan-400/10
                  "
                  required
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              mt-6 flex w-full items-center justify-center gap-2
              rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500
              px-5 py-3 font-black text-white
              shadow-lg shadow-cyan-500/20
              transition-all duration-300
              hover:scale-[1.01]
              disabled:cursor-not-allowed
              disabled:opacity-60
              disabled:hover:scale-100
            "
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Acesso permitido somente para usuários autorizados.
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;