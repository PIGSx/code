// src/components/ModalAutoinicializacao.jsx
import React, { useState } from 'react';

export default function ModalAutoinicializacao({ open, onClose, onConfirm }) {
  const [abasSelecionadas, setAbasSelecionadas] = useState([]);
  const [tempo, setTempo] = useState(5);
  const [loop, setLoop] = useState(false);

  const abasDisponiveis = ['Ptrac', 'Produção', 'geral', 'rastreador', 'material'];

  const toggleAba = (aba) => {
    setAbasSelecionadas((prev) =>
      prev.includes(aba) ? prev.filter((a) => a !== aba) : [...prev, aba]
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
        <h2 className="text-xl font-semibold">Configurar Autoinicialização</h2>

        <div>
          <p className="font-medium">Selecione as abas:</p>
          {abasDisponiveis.map((aba) => (
            <label key={aba} className="block">
              <input
                type="checkbox"
                checked={abasSelecionadas.includes(aba)}
                onChange={() => toggleAba(aba)}
              />
              <span className="ml-2">{aba}</span>
            </label>
          ))}
        </div>

        <div>
          <label>
            Intervalo (segundos):
            <input
              type="number"
              value={tempo}
              onChange={(e) => setTempo(Number(e.target.value))}
              className="ml-2 border rounded px-2"
              min={1}
            />
          </label>
        </div>

        <div>
          <label>
            <input
              type="checkbox"
              checked={loop}
              onChange={() => setLoop(!loop)}
            />
            <span className="ml-2">Repetir em loop</span>
          </label>
        </div>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(abasSelecionadas, tempo, loop)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
