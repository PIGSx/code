import { Link } from "react-router-dom";
import "./Grid.scss";

const colors = [
  "#371ae5",
  "#623cec",
  "#5a34f6",
  "#8553ff",
  "#8d5ff2",
  "#b981f9",
  "#e4a3ff",

];

const courses = [
   { title: "POLOS", path: "/polos" },
  { title: "PTRAC", path: "/ptrac" },
  { title: "RASTREADOR", path: "/rastreador" },
  { title: "CARTEIRA", path: "/carteira" },
  { title: "GERAL", path: "/geral" },
  { title: "MATERIAIS", path: "/materiais" },
  { title: "IORD", path: "/iord" },
  { title: "PENDENTE", path: "/pendente" },
];

const Grid = () => {
  return (
    <div className="ag-format-container">
      <div className="ag-courses_box">
        {courses.map((course, index) => {
          const bgColor = colors[index % colors.length]; // seleciona cor ciclicamente
          return (
            <div key={index} className="ag-courses_item">
              <Link to={course.path} className="ag-courses-item_link">
                <div
                  className="ag-courses-item_bg"
                  style={{ backgroundColor: bgColor }}
                ></div>
                <div className="ag-courses-item_title">{course.title}</div>
                {course.date && (
                  <div className="ag-courses-item_date-box">
                    Start:{" "}
                    <span className="ag-courses-item_date">{course.date}</span>
                  </div>
                )}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grid;
