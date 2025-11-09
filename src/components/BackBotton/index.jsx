import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BotaoVoltar() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1A] hover:bg-[#262626] text-white transition font-medium"
    >
      <ArrowLeft size={18} />
      Voltar
    </button>
  );
}
