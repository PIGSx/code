import { Link } from "react-router-dom";
import "./Grid.scss";

const colors = [
  "#f9b234",
  "#3ecd5e",
  "#e44002",
  "#952aff",
  "#cd3e94",
  "#4c49ea",
  "#ff6b6b", // adicione mais cores se precisar
];


const courses = [
  { title: "PTRAC", path: "/ptrac"},
  { title: "RASTREADOR", path: "/rastreador"},
  { title: "CARTEIRA", path: "/carteira"},
  { title: "GERAL", path: "/geral"},
  { title: "MATERIAL", path: "/material" },
  { title: "IORD", path: "/iord" },
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
                    Start: <span className="ag-courses-item_date">{course.date}</span>
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
