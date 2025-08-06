import './Navbar.scss';
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import ModalAutoinicializacao from '../Modal';
import { PauseCircle } from 'lucide-react'; // ícone bonito

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [config, setConfig] = useState(null);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => setIsActive(!isActive);

  const startAutoNavigation = ({ abasSelecionadas, tempo, loop }) => {
    let index = 0;

    const navigateToNext = () => {
      if (index < abasSelecionadas.length) {
        navigate(`/${abasSelecionadas[index].toLowerCase()}`);
        index++;
      } else if (loop) {
        index = 0;
        navigate(`/${abasSelecionadas[index].toLowerCase()}`);
        index++;
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    navigateToNext(); // Navega imediatamente
    intervalRef.current = setInterval(navigateToNext, tempo * 1000);
  };

  const handleConfirmar = (abasSelecionadas, tempo, loop) => {
    setShowModal(false);
    setConfig({ abasSelecionadas, tempo, loop });
    startAutoNavigation({ abasSelecionadas, tempo, loop });
  };

  const pararAutoNavegacao = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setConfig(null);
    // navigate('/'); // opcional: volta para a home
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const navItems = [
    { label: "Downloads", path: "/download" },
    { label: "Contato", path: "/contato" },
  ];

  return (
    <header>
      <nav>
        <Link className='logo-menu' to={"/"}>TECHNOBLADE</Link>

        <div
          className={`mobile-menu ${isActive ? "active" : ""}`}
          onClick={handleClick}
        >
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>

        <ul className={`nav-list ${isActive ? "active" : ""}`}>
          <li
            key="autoinicializacao"
            style={{
              animation: isActive
                ? `navLinkFade 0.5s ease forwards ${0.3}s`
                : "",
            }}
          >
            <span
              style={{ cursor: "pointer", color: "white" }}
              onClick={() => setShowModal(true)}
            >
              Autoinicialização
            </span>
          </li>

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

      <ModalAutoinicializacao
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmar}
      />

      {/* Botão flutuante para parar a navegação */}
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
