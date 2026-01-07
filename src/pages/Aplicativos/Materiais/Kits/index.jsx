import { useState } from "react";
import { Search } from "lucide-react";
import { useTheme } from "../../../../context/ThemeContext";

export default function Kits() {
  const { theme } = useTheme();
  const [search, setSearch] = useState("");

  const kits = [
    {
      titulo: "Troca de Hidrômetro",
      descricao: "Materiais utilizados para troca padrão de hidrômetro",
      itens: [
        "50001460 – Hidrômetro",
        "50001071 – Lacre",
      ],
    },
    {
      titulo: "Reparo de Cavalete",
      descricao: "Itens necessários para reparo de cavalete",
      itens: [
        "50001071 – Lacre",
      ],
    },
    {
      titulo: "Troca de Ramal de Água",
      descricao: "Materiais utilizados na substituição de ramal",
      itens: [
        "30001346 – Conexão macho",
        "30002394 – Conexão fêmea",
        "30001848 – Tubo PEAD",
      ],
    },
  ];

  const termo = search.toLowerCase();

  const kitsFiltrados = kits.filter((kit) => {
    return (
      kit.titulo.toLowerCase().includes(termo) ||
      kit.descricao.toLowerCase().includes(termo) ||
      kit.itens.some((item) => item.toLowerCase().includes(termo))
    );
  });

  return (
    <div
      className={`min-h-screen p-10 transition-colors duration-300
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
          text-4xl font-extrabold mb-8 text-center
          bg-gradient-to-r from-blue-500 to-cyan-400
          bg-clip-text text-transparent
        "
      >
        Kits de Materiais
      </h1>

      {/* PESQUISA GLOBAL */}
      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por TSS, código ou nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`
              w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none
              transition
              ${
                theme === "dark"
                  ? "bg-gray-800 text-gray-100 placeholder-gray-400"
                  : "bg-white text-gray-900 placeholder-gray-500 shadow"
              }
            `}
          />
        </div>
      </div>

      {/* RESULTADOS */}
      {kitsFiltrados.length === 0 ? (
        <p className="text-center text-gray-400">
          Nenhum kit encontrado
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
          {kitsFiltrados.map((kit, index) => (
            <div
              key={index}
              className={`
                rounded-3xl p-6 border transition-all duration-300
                ${
                  theme === "dark"
                    ? "bg-gray-900/70 border-gray-800"
                    : "bg-white border-gray-300 shadow-md"
                }
              `}
            >
              <h2 className="text-2xl font-bold mb-1">{kit.titulo}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {kit.descricao}
              </p>

              <div className="max-h-44 overflow-auto space-y-2 text-sm">
                {kit.itens.map((item, i) => (
                  <div
                    key={i}
                    className={`
                      px-3 py-2 rounded-lg
                      ${
                        theme === "dark"
                          ? "bg-gray-800/70"
                          : "bg-gray-100"
                      }
                    `}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
