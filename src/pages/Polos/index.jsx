import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

const cards = [
  {
    id: 1,
    title: "955",
    description: "Análise Polo ITAIM",
    link: "/itaim",
  },
  {
    id: 2,
    title: "921",
    description: "Análise Polo PENHA",
    link: "/penha",
  },
  {
    id: 3,
    title: "920",
    description: "Análise Polo São Miguel",
    link: "/sm",
  },
];

function Polos() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black py-16 px-4 text-gray-100">
      <h2 className="text-4xl font-extrabold text-center mb-12 tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
        Explore Nossos Polos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden border border-gray-700 hover:border-blue-400"
          >
            {/* Glow interno ao passar o mouse */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="flex flex-col items-center justify-center p-10 h-60 relative z-10">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 group-hover:bg-blue-600/30 transition-colors duration-300 mb-4 backdrop-blur-sm">
                <MapPin
                  className="w-8 h-8 text-blue-400 group-hover:text-cyan-300 transition-colors duration-300"
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-100 mb-1">
                {card.title}
              </h3>
              <p className="text-gray-400 text-center">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Polos;
