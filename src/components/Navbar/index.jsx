import './Navbar.scss';
import React, { useState } from "react";
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Sobre", path: "/sobre" },
    { label: "Projetos", path: "/projetos" },
    { label: "Contato", path: "/contato" },
  ];

  return (
    <header>
      <nav>
        <a className="logo" href="/">Codes</a>

        <div
          className={`mobile-menu ${isActive ? "active" : ""}`}
          onClick={handleClick}
        >
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>

        <ul className={`nav-list ${isActive ? "active" : ""}`}>
          {navItems.map((item, index) => (
            <li
              key={index}
              style={{
                animation: isActive
                  ? `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`
                  : "",
              }}
            >
              <Link to={item.path}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
