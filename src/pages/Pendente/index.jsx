import React, { useState } from "react";
import { LogOut, Lock, User, Upload } from "lucide-react";
import { getToken, getRole, clearAuth } from "../../utils/auth";
import api from "../../utils/apiAxios"; // ✅ novo cliente Axios centralizado

export default function Pendente() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    relatorio_fechados: null,
    planilha_prazos: null,
    pagina_guia: null,
    nome_do_relatorio: "",
  });

  const token = getToken();
  const role = getRole();

  // --- LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await api.post("/login", { username, password });

      if (res.data?.success && res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", res.data.user);
        localStorage.setItem("role", res.data.role);
        setMessage(`Bem-vindo, ${res.data.user}!`);
        setLoggedIn(true);
      } else {
        setError(res.data?.message || "Usuário ou senha inválidos.");
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Verifique sua conexão."
          : "Erro ao conectar com o servidor.");
      setError(msg);
    }
  };

  // --- HANDLE INPUTS ---
  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  // --- PROCESSAR ARQUIVOS ---
  const handleProcess = async (e) => {
    e.preventDefault();
    setMessage("Enviando arquivos...");

    if (!token) return setMessage("Você precisa estar logado.");
    if (!form.relatorio_fechados) return setMessage("Envie o arquivo principal.");

    const formData = new FormData();
    formData.append("relatorio_fechados", form.relatorio_fechados);
    if (form.planilha_prazos) formData.append("planilha_prazos", form.planilha_prazos);
    if (form.pagina_guia) formData.append("pagina_guia", form.pagina_guia);
    formData.append("nome_do_relatorio", form.nome_do_relatorio || "saida.xlsx");

    try {
      const res = await api.post("/pendente/processar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        responseType: "blob",
      });

      if (res.status !== 200) {
        setMessage("Erro ao processar arquivos.");
        return;
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", form.nome_do_relatorio || "saida.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setMessage("✅ Arquivo processado e baixado com sucesso!");
    } catch (err) {
      console.error("❌ Erro no processamento:", err);
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Servidor indisponível. Verifique sua conexão."
          : "Erro ao conectar com o servidor.");
      setMessage(msg);
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    clearAuth();
    setLoggedIn(false);
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
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-300 bg-clip-text text-transparent">
                Processar Arquivos
              </h2>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500 transition"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>

            <form onSubmit={handleProcess} className="space-y-4">
              {["relatorio_fechados", "planilha_prazos", "pagina_guia"].map((key, i) => (
                <div key={i} className="flex flex-col">
                  <label className="text-sm text-gray-400 mb-1 capitalize">
                    {key.replace("_", " ")}
                  </label>
                  <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    <input
                      type="file"
                      name={key}
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
