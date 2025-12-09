// src/router/index.jsx
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Download from "../pages/DownloadPage";
import Carteira from "../pages/Dashs/Carteira";
import Rastreador from "../pages/Aplicativos/Rastreador";
import Petrac from "../pages/Dashs/Petrac";
import Pendente from "../pages/Aplicativos/Pendente";
import Materiais from "../pages/Aplicativos/Materiais";
import Polos from "../pages/Dashs";
import Itaim from "../pages/Dashs/Polos/Itaim";
import Penha from "../pages/Dashs/Polos/Penha";
import SM from "../pages/Dashs/Polos/SM";
import MateriaisList from "../pages/Aplicativos/Materiais/MateriaisList";
import MateriaisApp from "../pages/Aplicativos/Materiais/MateriaisApp";
import PageNotFound from "../components/PageNotFound";
import LoginPage from "../pages/Login";

import BotaoVoltar from "../components/BackBotton";
import { isAuthenticated } from "../utils/auth";


// 🔒 Componente de Rota Protegida
const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;


// 🔒 Layout só aparece se estiver logado
const PrivateLayout = () => {
  const { pathname } = useLocation();
  const showBack =
    pathname !== "/" &&
    pathname !== "/login";

  return (
    <>
      <Navbar />

      {showBack && (
        <div className="px-6 py-3 bg-[#0C0F17]">
          <BotaoVoltar />
        </div>
      )}

      <Outlet />
    </>
  );
};


export default function RoutsPage() {
  return (
    <Routes>
      {/* 🔓 Login é público */}
      <Route path="/login" element={<LoginPage />} />

      {/* 🔒 Tudo aqui dentro é protegido */}
      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/rastreador" element={<Rastreador />} />
        <Route path="/download" element={<Download />} />
        <Route path="/ptrac" element={<Petrac />} />
        <Route path="/pendente" element={<Pendente />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/polos" element={<Polos />} />
        <Route path="/itaim" element={<Itaim />} />
        <Route path="/penha" element={<Penha />} />
        <Route path="/sm" element={<SM />} />
        <Route path="/materiaislist" element={<MateriaisList />} />
        <Route path="/materiaisapp" element={<MateriaisApp />} />
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
