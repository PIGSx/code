import { useEffect, useState } from "react";
import axios from "axios";

function Rastreador() {
  const [mensagem, setMensagem] = useState("Abrindo site...");

  useEffect(() => {
    const abrir = async () => {
      try {
        const response = await axios.post("http://localhost:5000/abrir-site");
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
