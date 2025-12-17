import { Navigate } from "react-router-dom";

const ROLE_LEVEL = {
  comum: 1,
  admin: 2,
  ti: 3,
};

export default function ProtectedRoute({ children, minRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role") || "comum";

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (ROLE_LEVEL[role] < ROLE_LEVEL[minRole]) {
    return <Navigate to="/" replace />;
  }

  return children;
}
