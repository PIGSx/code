import "./Navbar.scss";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ModalAutoinicializacao from "../Modal";
import { PauseCircle } from "lucide-react";

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => setIsActive(!isActive);
  const closeMenu = () => setIsActive(false);

  // Bloquear scroll ao abrir menu mobile
  useEffect(() => {
    document.body.style.overflow = isActive ? "hidden" : "auto";
  }, [isActive]);

  // --- Função principal de navegação automática ---
  const startAutoNavigation = ({
    abasSelecionadas,
    subCardsSelecionados,
    tempo,
    loop,
  }) => {
    if (!abasSelecionadas || abasSelecionadas.length === 0) return;

    const sequence = [];

    abasSelecionadas.forEach((aba) => {
      if (aba.toLowerCase() === "polos" && subCardsSelecionados["Polos"]) {
        subCardsSelecionados["Polos"].forEach((sub) => {
          if (sub === "955") sequence.push("/itaim");
          else if (sub === "921") sequence.push("/penha");
          else if (sub === "920") sequence.push("/sm");
        });

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

    setTimeout(navigateToNext, 300);
    intervalRef.current = setInterval(navigateToNext, tempo * 1000);
  };

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

  const pararAutoNavegacao = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setConfig(null);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const navItems = [
    { label: "Downloads", path: "/download" },
    { label: "Sobre", path: "/contato" },
  ];

  return (
    <header>
      <nav>
        <Link className="logo-menu" to={"/"} onClick={closeMenu}>
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
          <li>
            <span
              onClick={() => {
                setShowModal(true);
                closeMenu();
              }}
            >
              Autoinicialização
            </span>
          </li>

          {navItems.map((item, index) => (
            <li key={index}>
              <Link to={item.path} onClick={closeMenu}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Overlay escuro no fundo */}
        {isActive && <div className="menu-overlay" onClick={closeMenu}></div>}
      </nav>

      <ModalAutoinicializacao
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmar}
      />

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
