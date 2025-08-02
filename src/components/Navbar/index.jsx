// src/components/Navbar/Navbar.jsx
import './Navbar.scss';
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import ModalAutoinicializacao from '../Modal';

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const navItems = [
    { label: "Downloads", path: "/downloads" },
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

      {/* Modal fora do menu */}
      <ModalAutoinicializacao
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </header>
  );
};

export default Navbar;
