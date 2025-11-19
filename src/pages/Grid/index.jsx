import { Link } from "react-router-dom";
import "./Grid.scss";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";

const colors = [
  "#371ae5",
  "#623cec",
  "#5a34f6",
  "#8553ff",
  "#8d5ff2",
  "#b981f9",
  "#e4a3ff",
];

const Grid = () => {
  const [role, setRole] = useState("comum");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "comum";
    setRole(storedRole);
    setIsAdmin(storedRole === "admin");
  }, []); // roda uma vez ao montar

  const courses = [
    { title: "POLOS", path: "/polos" },
    { title: "PTRAC", path: "/ptrac" },
    { title: "RASTREADOR", path: "/rastreador", blocked: !isAdmin },
    { title: "CARTEIRA", path: "/carteira" },
    { title: "MATERIAIS", path: "/materiais" },
    { title: "IORD", path: "/iord" },
    { title: "PENDENTE", path: "/pendente" },
  ];

  return (
    <div className="ag-format-container">
      <div className="ag-courses_box">
        {courses.map((course, index) => {
          const bgColor = colors[index % colors.length];
          return (
            <div
              key={index}
              className={`ag-courses_item ${course.blocked ? "blocked" : ""}`}
            >
              {course.blocked ? (
                <div className="blocked-card">
                  {course.title}
                  <div className="blocked-overlay">
                    <Lock className="lock-icon" />
                    Aba liberada apenas para administradores
                  </div>
                </div>
              ) : (
                <Link to={course.path} className="ag-courses-item_link">
                  <div
                    className="ag-courses-item_bg"
                    style={{ backgroundColor: bgColor }}
                  ></div>
                  <div className="ag-courses-item_title">{course.title}</div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Grid;
