import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BotaoVoltar() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-3 py-1.5
                 text-sm text-purple-200
                 rounded-lg border border-purple-400/20
                 bg-transparent
                 transition-all
                 hover:bg-purple-400/10 hover:border-purple-400/40 hover:text-white"
    >
      <ArrowLeft size={16} />
      Voltar
    </button>
  );
}
