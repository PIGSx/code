import './Grid.scss';
import "bootstrap-icons/font/bootstrap-icons.css";

import almoxarifado from "../../assets/Home/almoxarifado.jpg";
import controle from "../../assets/Home/controle.jpg";
import geral from "../../assets/Home/geral.jpg";
import hidro from "../../assets/Home/hidro.jpg";
import parceiros from "../../assets/Home/parceiros.jpg";
import pendencias from "../../assets/Home/pendencias.jpg";
import producao from "../../assets/Home/producao.jpg";
import rastreador from "../../assets/Home/reposicao.jpg";

import { Link } from "react-router-dom";

const items = [
  { className: "one", img: hidro, title: "hidrometro", link: "/" },
  { className: "two", img: producao, title: "produção", link: "/" },
  { className: "three", img: pendencias, title: "pendencias", link: "/" },
  { className: "four", title: "dashboard - painel", isTitle: true },
  { className: "five", img: geral, title: "geral", link: "/geral" },
  { className: "six", img: almoxarifado, title: "almoxarifado", link: "/" },
  { className: "seven", img: controle, title: "controle", link: "/" },
  { className: "eight", img: rastreador, title: "rastreador", link: "/" },
  { className: "nine", img: parceiros, title: "parceiros", link: "/" },
];

const Grid = () => {
  return (
<main>
    <div className="banner">
      {items.map((item, index) => (
        <div className={`item ${item.className}`} key={index}>
          {item.isTitle ? (
            <h2 className="title">{item.title}</h2>
          ) : (
            <Link to={item.link || "/"}>
              <img src={item.img} alt={item.title} />
              <h4 className="name">{item.title}</h4>
              <i className="bi bi-arrow-right-square"></i>
            </Link>
          )}
        </div>
      ))}
    </div>
    </main>
  );
};

export default Grid;
