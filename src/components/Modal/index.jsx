// src/components/ModalAutoinicializacao.jsx
import React, { useState } from "react";
import { useTheme } from "../../context/ThemeContext";

const abasDisponiveis = [
  { nome: "Carteira", subCards: [] },
  { nome: "Polos", subCards: ["955", "921", "920"] },
  { nome: "Ptrac", subCards: [] },
  { nome: "rastreador", subCards: [] },
  { nome: "materiais", subCards: [] },
];

export default function ModalAutoinicializacao({ open, onClose, onConfirm }) {
  const { theme } = useTheme();

  const [abasSelecionadas, setAbasSelecionadas] = useState([]);
  const [subCardsSelecionados, setSubCardsSelecionados] = useState({});
  const [tempo, setTempo] = useState(5);
  const [loop, setLoop] = useState(false);

  const toggleAba = (aba) => {
    setAbasSelecionadas((prev) => {
      const novo = prev.includes(aba)
        ? prev.filter((a) => a !== aba)
        : [...prev, aba];

      if (!novo.includes(aba)) {
        setSubCardsSelecionados((prevSub) => {
          const { [aba]: _, ...rest } = prevSub;
          return rest;
        });
      }

      return novo;
    });
  };

  const toggleSubCard = (aba, subCard) => {
    setSubCardsSelecionados((prev) => ({
      ...prev,
      [aba]: prev[aba]?.includes(subCard)
        ? prev[aba].filter((s) => s !== subCard)
        : [...(prev[aba] || []), subCard],
    }));
  };

  if (!open) return null;

  return (
    <div
      className={`
        fixed inset-0 flex justify-center items-center z-50 backdrop-blur-sm
        ${theme === "dark" ? "bg-black/60" : "bg-black/40"}
      `}
    >
      <div
        className={`
          p-6 rounded-xl w-96 space-y-6 shadow-xl transition-all
          ${
            theme === "dark"
              ? "bg-gray-900/80 border border-purple-500/20 text-gray-200"
              : "bg-white/90 border border-gray-200 text-gray-800"
          }
        `}
      >
        <h2
          className={`
            text-xl font-semibold
            ${theme === "dark" ? "text-purple-300" : "text-purple-700"}
          `}
        >
          Configurar Autoinicialização
        </h2>

        {/* Seleção de abas */}
        <div>
          <p className="font-medium mb-2">Selecione as abas:</p>

          {abasDisponiveis.map((abaObj) => (
            <div key={abaObj.nome} className="mb-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={abasSelecionadas.includes(abaObj.nome)}
                  onChange={() => toggleAba(abaObj.nome)}
                  className="h-4 w-4 accent-purple-600"
                />
                <span className="ml-2 font-semibold">{abaObj.nome}</span>
              </label>

              {abasSelecionadas.includes(abaObj.nome) &&
                abaObj.subCards.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {abaObj.subCards.map((sub) => (
                      <label
                        key={sub}
                        className="flex items-center text-sm cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            subCardsSelecionados[abaObj.nome]?.includes(sub) ||
                            false
                          }
                          onChange={() => toggleSubCard(abaObj.nome, sub)}
                          className="h-3 w-3 accent-purple-600"
                        />
                        <span className="ml-2">{sub}</span>
                      </label>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* Configurações adicionais */}
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            Intervalo (segundos):
            <input
              type="number"
              value={tempo}
              min={1}
              onChange={(e) => setTempo(Number(e.target.value))}
              className={`
                ml-2 border rounded px-2 w-20
                ${
                  theme === "dark"
                    ? "bg-gray-800 border-purple-400/40 text-gray-100"
                    : "bg-white border-gray-300 text-gray-800"
                }
              `}
            />
          </label>

          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={loop}
              onChange={() => setLoop(!loop)}
              className="h-4 w-4 accent-purple-600"
            />
            <span className="ml-2">Repetir em loop</span>
          </label>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`
              px-4 py-2 rounded transition
              ${
                theme === "dark"
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-300 text-gray-900 hover:bg-gray-400"
              }
            `}
          >
            Cancelar
          </button>

          <button
            onClick={() =>
              onConfirm(abasSelecionadas, subCardsSelecionados, tempo, loop)
            }
            className={`
              px-4 py-2 rounded text-white transition
              ${
                theme === "dark"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-blue-500 hover:bg-blue-600"
              }
            `}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}




