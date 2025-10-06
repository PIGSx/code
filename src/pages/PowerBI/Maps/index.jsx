import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function Rastreador() {
  const [mensagem, setMensagem] = useState("Abrindo site...");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'error'

  useEffect(() => {
    const abrir = async () => {
      const API_URL =
        window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:5002"
          : "https://code-rastreador.onrender.com";

      try {
        const response = await axios.post(`${API_URL}/abrir-site`);
        setMensagem(response.data.mensagem);
        setStatus("success");
      } catch (error) {
        setMensagem("Erro: " + (error.response?.data?.mensagem || error.message));
        setStatus("error");
      }
    };

    abrir();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-6">
      <div className="max-w-md w-full bg-gray-800/60 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Acesso Automático
        </h2>

        <div className="flex flex-col items-center justify-center text-center space-y-3">
          {status === "loading" && (
            <>
              <Loader2 className="animate-spin text-blue-400 w-10 h-10" />
              <p className="text-gray-300 animate-pulse">{mensagem}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle2 className="text-green-400 w-10 h-10" />
              <p className="text-green-300">{mensagem}</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="text-red-400 w-10 h-10" />
              <p className="text-red-300">{mensagem}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Rastreador;
