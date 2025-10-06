import { useEffect, useState } from "react";
import axios from "axios";

function Rastreador() {
  const [mensagem, setMensagem] = useState("Abrindo site...");

  useEffect(() => {
    const abrir = async () => {
     const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5002" // ambiente local
    : "https://code-rastreador.onrender.com"; // ambiente de produção (Render)

try {
  const response = await axios.post(`${API_URL}/abrir-site`);
  setMensagem(response.data.mensagem);
} catch (error) {
  setMensagem("Erro: " + (error.response?.data?.mensagem || error.message));
}
    };

    abrir();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Abrindo acesso automático</h2>
      <p>{mensagem}</p>
    </div>
  );
}

export default Rastreador;
// aaa