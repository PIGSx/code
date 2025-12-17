import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import BotaoVoltar from "../components/BackBotton";
import PageNotFound from "../components/PageNotFound";

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

import LoginPage from "../pages/Login";

/* ===== SUPORTE ===== */
import AbrirChamado from "../pages/Support/Abertura";
import MeusChamados from "../pages/Support/MeusChamados";
import ListaChamados from "../pages/Support/Lista";
import DetalheChamado from "../pages/Support/Detalhe";

import { isAuthenticated } from "../utils/auth";
import ProtectedRoute from "./ProtectedRoute";

/* =============================
   Rotas privadas (login)
   ============================= */
const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

/* =============================
   Layout protegido
   ============================= */
const PrivateLayout = () => {
  const { pathname } = useLocation();
  const showBack = pathname !== "/" && pathname !== "/login";

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

export default function RoutesPage() {
  return (
    <Routes>
      {/* =============================
          Público
         ============================= */}
      <Route path="/login" element={<LoginPage />} />

      {/* =============================
          Privado (logado)
         ============================= */}
      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        {/* ===== Geral ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<Download />} />
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/rastreador" element={<Rastreador />} />
        <Route path="/ptrac" element={<Petrac />} />
        <Route path="/pendente" element={<Pendente />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/polos" element={<Polos />} />
        <Route path="/itaim" element={<Itaim />} />
        <Route path="/penha" element={<Penha />} />
        <Route path="/sm" element={<SM />} />
        <Route path="/materiaislist" element={<MateriaisList />} />
        <Route path="/materiaisapp" element={<MateriaisApp />} />

        {/* =============================
            SUPORTE — USUÁRIO COMUM
           ============================= */}
        <Route
          path="/chamados/novo"
          element={
            <ProtectedRoute minRole="comum">
              <AbrirChamado />
            </ProtectedRoute>
          }
        />

        <Route
          path="/meus-chamados"
          element={
            <ProtectedRoute minRole="comum">
              <MeusChamados />
            </ProtectedRoute>
          }
        />

        {/* =============================
            SUPORTE — TI / ADMIN
           ============================= */}
        <Route
          path="/chamados"
          element={
            <ProtectedRoute minRole="admin">
              <ListaChamados />
            </ProtectedRoute>
          }
        />

        {/* =============================
            DETALHE DO CHAMADO (CHAT)
            → comum, admin e TI
           ============================= */}
        <Route
          path="/chamados/:id"
          element={
            <ProtectedRoute minRole="comum">
              <DetalheChamado />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* =============================
          404
         ============================= */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
