import React from "react";
import { useNavigate } from "react-router-dom";
import { List, AppWindow } from "lucide-react";
import { isAuthenticated } from "../../utils/auth";

export default function Ylika() {
  const navigate = useNavigate();

  const cards = [
    {
      id: 1,
      title: "Lista de Materiais",
      description: "Visualize todos os materiais disponíveis.",
      link: "/materiaislist",
      icon: (
        <List className="w-8 h-8 text-blue-400 group-hover:text-cyan-300 transition-colors duration-300" />
      ),
    },
    {
      id: 2,
      title: "Aplicativo de Baixas",
      description: "Gerencie as baixas de materiais na base.",
      link: "/materiaisapp",
      icon: (
        <AppWindow className="w-8 h-8 text-blue-400 group-hover:text-cyan-300 transition-colors duration-300" />
      ),
    },
  ];

  const handleNavigate = (link) => {
    // redireciona para login se não estiver autenticado
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      navigate(link);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100 flex flex-col items-center py-16 px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-12 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent text-center">
        Explore Nossos Polos
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 w-full max-w-5xl">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleNavigate(card.link)}
            className="group relative bg-gray-900/60 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-xl hover:shadow-blue-500/30 hover:border-blue-400/40 transition-all duration-500 cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="flex flex-col items-center justify-center p-10 h-60 relative z-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 group-hover:bg-blue-600/30 transition-all duration-300 mb-4 backdrop-blur-sm">
                {card.icon}
              </div>

              <h3 className="text-2xl font-bold text-gray-100 mb-2 text-center">
                {card.title}
              </h3>
              <p className="text-gray-400 text-center max-w-xs">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
