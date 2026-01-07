import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";

/* ===== COMPONENTES ===== */
import Navbar from "../components/Navbar";
import BotaoVoltar from "../components/BackBotton";
import PageNotFound from "../components/PageNotFound";

/* ===== PÁGINAS ===== */
import Home from "../pages/Home";
import Download from "../pages/DownloadPage";

/* ===== DASHBOARDS ===== */
import Carteira from "../pages/Dashs/Carteira";
import Petrac from "../pages/Dashs/Petrac";
import Polos from "../pages/Dashs";
import Itaim from "../pages/Dashs/Polos/Itaim";
import Penha from "../pages/Dashs/Polos/Penha";
import SM from "../pages/Dashs/Polos/SM";

/* ===== APLICATIVOS ===== */
import Rastreador from "../pages/Aplicativos/Rastreador";
import Camera from "../pages/Aplicativos/Camera";
import Pendente from "../pages/Aplicativos/Pendente";
import Materiais from "../pages/Aplicativos/Materiais";
import MateriaisList from "../pages/Aplicativos/Materiais/MateriaisList";
import MateriaisApp from "../pages/Aplicativos/Materiais/MateriaisApp";
import Kits from "../pages/Aplicativos/Materiais/Kits"

/* ===== LOGIN ===== */
import LoginPage from "../pages/Login";

/* ===== SUPORTE ===== */
import SupportHub from "../pages/Support/SupportHub";
import AbrirChamado from "../pages/Support/Abertura";
import MeusChamados from "../pages/Support/MeusChamados";
import ListaChamados from "../pages/Support/Lista";
import DetalheChamado from "../pages/Support/Detalhe";

/* ===== AUTH ===== */
import { isAuthenticated } from "../utils/auth";
import ProtectedRoute from "./ProtectedRoute";

/* =============================
   ROTA PRIVADA (LOGIN)
   ============================= */
const PrivateRoute = ({ children }) =>
  isAuthenticated() ? children : <Navigate to="/login" replace />;

/* =============================
   LAYOUT PRIVADO
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

/* =============================
   ROTAS
   ============================= */
export default function RoutesPage() {
  return (
    <Routes>
      {/* =============================
          PÚBLICO
         ============================= */}
      <Route path="/login" element={<LoginPage />} />

      {/* =============================
          PRIVADO (LOGADO)
         ============================= */}
      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        {/* ===== GERAL ===== */}
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<Download />} />

        {/* ===== DASH ===== */}
        <Route path="/carteira" element={<Carteira />} />
        <Route path="/ptrac" element={<Petrac />} />
        <Route path="/polos" element={<Polos />} />
        <Route path="/itaim" element={<Itaim />} />
        <Route path="/penha" element={<Penha />} />
        <Route path="/sm" element={<SM />} />

        {/* ===== APLICATIVOS ===== */}
        <Route path="/rastreador" element={<Rastreador />} />
        <Route path="/camera" element={<Camera/> } />
        <Route path="/pendente" element={<Pendente />} />
        <Route path="/materiais" element={<Materiais />} />
        <Route path="/materiaislist" element={<MateriaisList />} />
        <Route path="/materiaisapp" element={<MateriaisApp />} />
        <Route path="/kits" element={<Kits/>} />

        {/* =============================
            SUPORTE — USUÁRIO COMUM
           ============================= */}
        <Route
          path="/suporte"
          element={
            <ProtectedRoute minRole="comum">
              <SupportHub />
            </ProtectedRoute>
          }
        />

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
            DETALHE DO CHAMADO
            (comum, TI e admin)
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
