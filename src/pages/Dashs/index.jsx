import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useTheme } from "../../context/ThemeContext"; // <-- IMPORTANTE

const cards = [
  { id: 1, title: "955", description: "Análise Polo ITAIM", link: "/itaim" },
  { id: 2, title: "921", description: "Análise Polo PENHA", link: "/penha" },
  { id: 3, title: "920", description: "Análise Polo São Miguel", link: "/sm" },
];

export default function Polos() {
  const navigate = useNavigate();
  const { theme } = useTheme(); // <-- AQUI PEGA O TEMA ATUAL ("light" ou "dark")

  return (
    <div
      className={`
        min-h-screen py-16 px-4 transition-colors duration-300

        ${theme === "dark"
          ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
          : "bg-gradient-to-b from-gray-100 via-white to-gray-200 text-gray-800"
        }
      `}
    >
      <h2
        className={`
          text-4xl font-extrabold text-center mb-12 tracking-tight
          bg-clip-text text-transparent

          ${theme === "dark"
            ? "bg-gradient-to-r from-blue-300 to-cyan-200"
            : "bg-gradient-to-r from-blue-500 to-cyan-400"
          }
        `}
      >
        Explore Nossos Polos
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className={`
              group relative cursor-pointer overflow-hidden 
              rounded-3xl transition-all duration-300 border backdrop-blur-sm

              ${theme === "dark"
                ? "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 hover:border-blue-400 hover:shadow-blue-500/30"
                : "bg-white border-gray-300 shadow-md hover:shadow-blue-300/40"
              }
            `}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/5"></div>

            <div className="flex flex-col items-center justify-center p-10 h-60 relative z-10">
              <div
                className={`
                  flex items-center justify-center w-16 h-16 rounded-full mb-4 
                  transition-colors duration-300 backdrop-blur-sm

                  ${theme === "dark"
                    ? "bg-blue-500/10 group-hover:bg-blue-600/30"
                    : "bg-blue-500/10 group-hover:bg-blue-600/30"
                  }
                `}
              >
                <MapPin
                  className={`
                    w-8 h-8 transition-colors duration-300

                    ${theme === "dark"
                      ? "text-blue-300 group-hover:text-cyan-200"
                      : "text-blue-500 group-hover:text-cyan-400"
                    }
                  `}
                />
              </div>

              <h3
                className={`
                  text-2xl font-bold mb-1

                  ${theme === "dark" ? "text-gray-100" : "text-gray-900"}
                `}
              >
                {card.title}
              </h3>

              <p
                className={`
                  text-center

                  ${theme === "dark" ? "text-gray-400" : "text-gray-600"}
                `}
              >
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
