import React from "react";
import { useNavigate } from "react-router-dom";
import { List, AppWindow, Package } from "lucide-react";
import { isAuthenticated } from "../../../utils/auth";
import { useTheme } from "../../../context/ThemeContext";

export default function Ylika() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const cards = [
    {
      id: 1,
      title: "Lista de Materiais",
      description: "Visualize todos os materiais disponíveis.",
      link: "/materiaislist",
      icon: <List className="w-8 h-8" />,
    },
    {
      id: 2,
      title: "Aplicativo de Baixas",
      description: "Gerencie as baixas de materiais na base.",
      link: "/materiaisapp",
      icon: <AppWindow className="w-8 h-8" />,
    },
    {
      id: 3,
      title: "Kits",
      description: "Materiais usados em casa TSS para base e operações.",
      link: "/kits",
      icon: <Package className="w-8 h-8" />,
    },
  ];

  const handleNavigate = (link) => {
    if (!isAuthenticated()) {
      navigate("/login");
    } else {
      navigate(link);
    }
  };

  return (
    <div
      className={`
        min-h-screen flex flex-col items-center py-16 px-4 transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
            : "bg-gray-50 text-gray-900"
        }
      `}
    >
      {/* TÍTULO */}
      <h1
        className="
          text-4xl md:text-5xl font-extrabold tracking-tight mb-14
          bg-gradient-to-r from-blue-500 to-cyan-400
          bg-clip-text text-transparent text-center
        "
      >
        Materiais
      </h1>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => handleNavigate(card.link)}
            className={`
              group relative cursor-pointer overflow-hidden rounded-3xl
              transition-all duration-500 border backdrop-blur-xl

              ${
                theme === "dark"
                  ? "bg-gray-900/70 border-gray-800 hover:border-blue-400/50 hover:shadow-blue-500/30"
                  : `
                      bg-gradient-to-br from-slate-100 via-white to-slate-200
                      border-slate-300
                      shadow-lg shadow-slate-300/40
                      hover:border-blue-400/60
                      hover:shadow-blue-400/40
                    `
              }
            `}
          >
            {/* ACCENT LATERAL (LIGHT MODE) */}
            {theme !== "dark" && (
              <div className="absolute left-0 top-0 h-full w-1 bg-blue-400/70" />
            )}

            {/* EFEITO HOVER */}
            <div
              className="
                absolute inset-0 opacity-0 group-hover:opacity-100
                transition-opacity duration-700
                bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10
              "
            />

            {/* CONTEÚDO */}
            <div className="relative z-10 flex flex-col items-center justify-center p-12 h-64">
              {/* ÍCONE */}
              <div
                className={`
                  flex items-center justify-center w-16 h-16 rounded-full mb-5
                  transition-all duration-300 backdrop-blur-md
                  ${
                    theme === "dark"
                      ? "bg-blue-500/15 group-hover:bg-blue-500/30"
                      : "bg-blue-500/15 group-hover:bg-blue-500/25"
                  }
                `}
              >
                <div
                  className={`
                    transition-colors duration-300
                    ${
                      theme === "dark"
                        ? "text-blue-300 group-hover:text-cyan-200"
                        : "text-blue-600 group-hover:text-cyan-500"
                    }
                  `}
                >
                  {card.icon}
                </div>
              </div>

              {/* TEXTO */}
              <h3
                className={`
                  text-2xl font-bold mb-2 text-center
                  ${theme === "dark" ? "text-gray-100" : "text-gray-900"}
                `}
              >
                {card.title}
              </h3>

              <p
                className={`
                  text-center max-w-xs
                  ${theme === "dark" ? "text-gray-400" : "text-gray-700"}
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
