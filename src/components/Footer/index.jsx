import React from "react";
import { useTheme } from "../../context/ThemeContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <footer
      className={`
        relative overflow-hidden  transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-black to-[#0f172a] text-gray-200"
            : "bg-gradient-to-b from-[#e9edf5] via-[#dfe4ee] to-[#d3d9e4] text-gray-800"
        }
      `}
    >
      {/* Texto gigante ao fundo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <span
          className={`
            text-[20vw] font-bold whitespace-nowrap select-none
            ${
              theme === "dark"
                ? "text-[#2c9c49]"
                : "text-purple-300/60"
            }
          `}
        >
          Technoblade
        </span>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <p
              className={`
                text-sm leading-6 border-l-2 pl-4 p-4 rounded-r-2xl backdrop-blur-md 
                shadow-sm transition-all
                ${
                  theme === "dark"
                    ? "border-[#9f37ea] bg-gray-900/40 text-gray-200"
                    : "border-purple-400 bg-white/40 text-gray-800 shadow-md"
                }
              `}
            >
              "Seu futuro digital começa aqui: soluções seguras, ágeis e
              inteligentes."
            </p>
          </div>
        </div>

        {/* Rodapé inferior */}
        <div
          className={`
            mt-12 pt-8 border-t 
            ${
              theme === "dark"
                ? "border-[#9f37ea]/30"
                : "border-purple-400/30"
            }
          `}
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p
              className={`
                text-sm tracking-wide
                ${
                  theme === "dark"
                    ? "text-[#9f37ea]"
                    : "text-purple-700"
                }
              `}
            >
              © {currentYear} Technolade, Inc. All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
