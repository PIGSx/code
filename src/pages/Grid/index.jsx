import { Link } from "react-router-dom";
import { Lock, Layers, BarChart3 } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const colors = [
  "#371ae5",
  "#623cec",
  "#5a34f6",
  "#8553ff",
  "#8d5ff2",
  "#b981f9",
  "#e4a3ff",
];

export default function Grid() {
  const { theme } = useTheme();

  const [role, setRole] = useState("comum");
  const [isAdmin, setIsAdmin] = useState(false);

  const [activeCategory, setActiveCategory] = useState(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "comum";
    setRole(storedRole);
    setIsAdmin(storedRole === "admin");
  }, []);

  const apps = [
    { title: "RASTREADOR", path: "/rastreador", blocked: !isAdmin },
    { title: "MATERIAIS", path: "/materiais" },
    { title: "PENDENTE", path: "/pendente" },
  ];

  const dashboards = [
    { title: "IORD", path: "/iord" },
    { title: "POLOS", path: "/polos" },
    { title: "PTRAC", path: "/ptrac" },
    { title: "CARTEIRA", path: "/carteira" },
  ];

  const handleClick = (category) => {
    if (activeCategory === category) {
      setIsFading(true);
      setTimeout(() => {
        setActiveCategory(null);
        setIsFading(false);
      }, 200);
      return;
    }

    if (activeCategory !== null && category !== activeCategory) {
      setIsFading(true);
      setTimeout(() => {
        setActiveCategory(category);
        setIsFading(false);
      }, 200);
      return;
    }

    setActiveCategory(category);
  };

  const selectedList =
    activeCategory === "apps"
      ? apps
      : activeCategory === "dash"
      ? dashboards
      : [];

  return (
    <div
      className={`min-h-screen p-8 transition-colors duration-300
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-gray-900 via-gray-950 to-black text-gray-100"
            : "bg-gray-50 text-gray-900"
        }`}
    >
      {/* CABEÇALHO */}
      <div className="flex gap-6 mb-10 justify-center">

        {/* BOTÃO APLICATIVOS */}
        <button
          onClick={() => handleClick("apps")}
          className={`
            relative flex flex-col items-center gap-3 px-7 py-6 rounded-3xl 
            transition-all duration-300 w-52 shadow-md overflow-hidden
            
            ${
              activeCategory === "apps"
                ? "bg-blue-600 text-white scale-105 shadow-blue-500/40"
                : `
                  bg-white dark:bg-gray-800
                  text-black dark:text-white
                  border border-gray-200 dark:border-gray-700 
                  hover:scale-105 hover:shadow-xl
                `
            }
          `}
        >
          {/* LINHA ANIMADA PRETA (somente quando não está ativo) */}
          {activeCategory !== "apps" && (
            <motion.div
              className="absolute top-0 left-0 h-1 bg-black"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <Layers className="w-8 h-8 opacity-90" />
          <span className="text-xl font-bold -mt-1">Aplicativos</span>

          {activeCategory !== "apps" && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              Aplicações de uso operacional
            </p>
          )}
        </button>

        {/* BOTÃO DASHBOARDS */}
        <button
          onClick={() => handleClick("dash")}
          className={`
            relative flex flex-col items-center gap-3 px-7 py-6 rounded-3xl 
            transition-all duration-300 w-52 shadow-md overflow-hidden

            ${
              activeCategory === "dash"
                ? "bg-blue-600 text-white scale-105 shadow-blue-500/40"
                : `
                  bg-white dark:bg-gray-800
                  text-black dark:text-white
                  border border-gray-200 dark:border-gray-700
                  hover:scale-105 hover:shadow-xl
                `
            }
          `}
        >
          {/* LINHA ANIMADA PRETA */}
          {activeCategory !== "dash" && (
            <motion.div
              className="absolute top-0 left-0 h-1 bg-black"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "100%", "0%"] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          <BarChart3 className="w-8 h-8 opacity-90" />
          <span className="text-xl font-bold -mt-1">Dashboards</span>

          {activeCategory !== "dash" && (
            <p className="text-sm mt-1 text-gray-600 dark:text-gray-400">
              Painéis de acompanhamento
            </p>
          )}
        </button>
      </div>

      {/* GRID PRINCIPAL */}
      {activeCategory && (
        <div className="flex justify-center">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 transition-all 
              duration-300 max-w-5xl w-full
              ${isFading ? "opacity-0 translate-y-3" : "opacity-100"}
            `}
          >
            {selectedList.map((course, index) => {
              const bgColor = colors[index % colors.length];

              return (
                <div
                  key={index}
                  className={`
                    relative rounded-3xl overflow-hidden transition-all duration-300
                    ${
                      course.blocked
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-[1.04] hover:shadow-2xl"
                    }
                  `}
                >
                  {/* BLOQUEADO */}
                  {course.blocked ? (
                    <div className="bg-black/30 backdrop-blur-2xl text-white p-10 text-center font-semibold text-2xl rounded-3xl shadow-xl">
                      {course.title}

                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Lock className="w-7 h-7 mr-2" />
                        <span className="text-lg">Apenas administradores</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={course.path}
                      className="group block relative p-10 rounded-3xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700"
                    >
                      {/* CÍRCULO COLORIDO */}
                      <div
                        className="absolute w-40 h-40 rounded-full blur-3xl opacity-40 top-[-80px] right-[-80px] transition-all duration-700 
                          group-hover:scale-[6]"
                        style={{ backgroundColor: bgColor }}
                      />

                      {/* TÍTULO */}
                      <div
                        className={`
                          relative text-3xl font-extrabold tracking-wide drop-shadow-md
                          ${theme === "dark" ? "text-white" : "text-gray-900"}
                        `}
                      >
                        {course.title}
                      </div>

                      {/* LINHA DECORATIVA */}
                      <div
                        className={`
                          relative w-16 h-[3px] mt-4 rounded-full transition-all duration-300
                          group-hover:w-24
                          ${
                            theme === "dark"
                              ? "bg-white/70"
                              : "bg-gray-900/70"
                          }
                        `}
                      />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
