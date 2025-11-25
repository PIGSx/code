import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";

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
      {/* MENU SUPERIOR */}
      <div className="flex gap-4 mb-10 justify-center">
        <button
          onClick={() => handleClick("apps")}
          className={`px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-200
            ${
              activeCategory === "apps"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:scale-105"
            }`}
        >
          Aplicativos
        </button>

        <button
          onClick={() => handleClick("dash")}
          className={`px-6 py-3 rounded-2xl font-semibold text-lg transition-all duration-200
            ${
              activeCategory === "dash"
                ? "bg-blue-600 text-white shadow-lg scale-105"
                : "bg-gray-300 dark:bg-gray-700 dark:text-gray-200 hover:scale-105"
            }`}
        >
          Dashboards
        </button>
      </div>

      {/* GRID CENTRALIZADO */}
      {activeCategory && (
        <div className="flex justify-center">
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 transition-all 
              duration-300 max-w-5xl w-full
              ${isFading ? "opacity-0 translate-y-3" : "opacity-100"}
            `}
          >
            {selectedList.map((course, index) => {
              const bgColor = colors[index % colors.length];

              return (
                <div
                  key={index}
                  className={`relative rounded-3xl overflow-hidden transition-transform duration-300 
                    ${
                      course.blocked
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                >
                  {/* BLOQUEADO */}
                  {course.blocked ? (
                    <div className="bg-black/30 backdrop-blur-xl text-white p-8 text-center font-bold text-2xl">
                      {course.title}

                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Lock className="w-6 h-6 mr-2" />
                        <span>Aba liberada apenas para administradores</span>
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={course.path}
                      className="group block relative bg-[#121212] dark:bg-[#121212] p-8 rounded-3xl overflow-hidden"
                    >
                      {/* CÍRCULO COLORIDO EXPANDINDO */}
                      <div
                        className="absolute w-32 h-32 rounded-full top-[-70px] right-[-70px] transition-transform duration-500 
                          group-hover:scale-[9]"
                        style={{ backgroundColor: bgColor }}
                      />

                      {/* TÍTULO */}
                      <div className="relative text-white text-3xl font-bold min-h-[80px]">
                        {course.title}
                      </div>
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
