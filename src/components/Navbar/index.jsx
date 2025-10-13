import "./Navbar.scss";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalAutoinicializacao from "../Modal";
import { PauseCircle } from "lucide-react"; // Ícone bonito

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => setIsActive(!isActive);

  // --- Função principal de navegação automática ---
  const startAutoNavigation = ({
    abasSelecionadas,
    subCardsSelecionados,
    tempo,
    loop,
  }) => {
    if (!abasSelecionadas || abasSelecionadas.length === 0) return;

    // Cria uma sequência linear de rotas
    const sequence = [];

    abasSelecionadas.forEach((aba) => {
      // Aba "Polos" tem subcards especiais (955, 921, 920)
      if (aba.toLowerCase() === "polos" && subCardsSelecionados["Polos"]) {
        subCardsSelecionados["Polos"].forEach((sub) => {
          if (sub === "955") sequence.push("/itaim");
          else if (sub === "921") sequence.push("/penha");
          else if (sub === "920") sequence.push("/sm");
        });

        // Caso o usuário selecione só "Polos" (sem subcards)
        if (subCardsSelecionados["Polos"].length === 0) {
          sequence.push("/polos");
        }
      } else {
        sequence.push(`/${aba.toLowerCase()}`);
      }
    });

    if (sequence.length === 0) return;

    let index = 0;

    const navigateToNext = () => {
      if (index < sequence.length) {
        navigate(sequence[index]);
        index++;
      } else if (loop) {
        index = 0;
        navigate(sequence[index]);
        index++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Pequeno delay pra evitar “piscar” ao iniciar
    setTimeout(navigateToNext, 300);
    intervalRef.current = setInterval(navigateToNext, tempo * 1000);
  };

  // --- Quando o usuário confirma no modal ---
  const handleConfirmar = (
    abasSelecionadas,
    subCardsSelecionados,
    tempo,
    loop
  ) => {
    setShowModal(false);
    setConfig({ abasSelecionadas, subCardsSelecionados, tempo, loop });
    startAutoNavigation({ abasSelecionadas, subCardsSelecionados, tempo, loop });
  };

  // --- Parar navegação automática ---
  const pararAutoNavegacao = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setConfig(null);
  };

  // --- Limpeza ao desmontar ---
  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  // --- Itens padrão do menu ---
  const navItems = [
    { label: "Downloads", path: "/download" },
    { label: "Sobre", path: "/contato" },
  ];

  return (
    <header>
      <nav>
        <Link className="logo-menu" to={"/"}>
          TECHNOBLADE
        </Link>

        <div
          className={`mobile-menu ${isActive ? "active" : ""}`}
          onClick={handleClick}
        >
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>

        <ul className={`nav-list ${isActive ? "active" : ""}`}>
          {/* Item de autoinicialização */}
          <li
            key="autoinicializacao"
            style={{
              animation: isActive ? `navLinkFade 0.5s ease forwards 0.3s` : "",
            }}
          >
            <span
              style={{ cursor: "pointer", color: "white" }}
              onClick={() => setShowModal(true)}
            >
              Autoinicialização
            </span>
          </li>

          {/* Outros itens do menu */}
          {navItems.map((item, index) => (
            <li
              key={index}
              style={{
                animation: isActive
                  ? `navLinkFade 0.5s ease forwards ${(index + 1) / 7 + 0.3}s`
                  : "",
              }}
            >
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Modal de autoinicialização */}
      <ModalAutoinicializacao
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmar}
      />

      {/* Botão flutuante de parar navegação */}
      {config && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={pararAutoNavegacao}
            className="bg-red-600 text-white p-2 rounded-full shadow-xl hover:bg-red-700"
            title="Parar Navegação Automática"
          >
            <PauseCircle size={32} />
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
