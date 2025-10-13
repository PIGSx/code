import React from "react";
import { useNavigate } from "react-router-dom";

const cards = [
  {
    id: 1,
    title: "955",
    description: "Analise polo ITAIM",
    link: "/itaim",
  },
  {
    id: 2,
    title: "921",
    description: "Analise polo PENHA",
    link: "/penha",
  },
  {
    id: 3,
    title: "920",
    description: "Analise polo São Miguel",
    link: "/sm",
  },
];

function Polos() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Explore nossas seções
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className="cursor-pointer bg-white rounded-2xl shadow-md overflow-hidden flex flex-col items-center justify-center p-10 h-56 transform hover:scale-105 hover:shadow-xl transition duration-300"
          >
            <div className="text-2xl font-bold text-zinc-800 mb-2">
              {card.title}
            </div>
            <p className="text-gray-600 text-center">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Polos;
