// src/router/index.jsx
import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Download from "../pages/DownloadPage";
import Carteira from "../pages/PowerBI/Carteira";
import Rastreador from "../pages/PowerBI/Maps";
import Petrac from "../pages/PowerBI/Petrac";
import Pendente from "../pages/Pendente";
import Materiais from "../pages/Materiais";
import Polos from "../pages/Polos";
import Itaim from "../pages/PowerBI/Polos/Itaim";
import Penha from "../pages/PowerBI/Polos/Penha";
import SM from "../pages/PowerBI/Polos/SM";
import MateriaisList from "../pages/Materiais/MateriaisList";
import MateriaisApp from "../pages/Materiais/MateriaisApp";
import PageNotFound from "../components/PageNotFound";
import LoginPage from "../pages/Login";

import { isAuthenticated } from "../utils/auth";
import BotaoVoltar from "../components/BackBotton";

// Layout padrão com Navbar + Botão de Voltar
const DefaultLayout = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/"; // Não mostra botão na Home

  return (
    <>
      <Navbar />

      {!isHome && (
        <div className="p-4">
          <BotaoVoltar />
        </div>
      )}

      <Outlet />
    </>
  );
};

// Rota privada — protege páginas após login
const PrivateRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function RoutsPage() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login sem layout */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rotas com layout padrão */}
        <Route element={<DefaultLayout />}>

          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/carteira" element={<PrivateRoute><Carteira /></PrivateRoute>} />
          <Route path="/rastreador" element={<PrivateRoute><Rastreador /></PrivateRoute>} />
          <Route path="/download" element={<PrivateRoute><Download /></PrivateRoute>} />
          <Route path="/ptrac" element={<PrivateRoute><Petrac /></PrivateRoute>} />
          <Route path="/pendente" element={<PrivateRoute><Pendente /></PrivateRoute>} />
          <Route path="/materiais" element={<PrivateRoute><Materiais /></PrivateRoute>} />
          <Route path="/polos" element={<PrivateRoute><Polos /></PrivateRoute>} />
          <Route path="/itaim" element={<PrivateRoute><Itaim /></PrivateRoute>} />
          <Route path="/penha" element={<PrivateRoute><Penha /></PrivateRoute>} />
          <Route path="/sm" element={<PrivateRoute><SM /></PrivateRoute>} />
          <Route path="/materiaislist" element={<PrivateRoute><MateriaisList /></PrivateRoute>} />
          <Route path="/materiaisapp" element={<PrivateRoute><MateriaisApp /></PrivateRoute>} />

        </Route>

        {/* 404 */}
        <Route path="*" element={<PageNotFound />} />

      </Routes>
    </BrowserRouter>
  );
}
