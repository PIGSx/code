import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Download from "../pages/DownloadPage";
import Geral from "../pages/PowerBI/Geral";
import PageNotFound from "../components/PageNotFound";
import Carteira from "../pages/PowerBI/Carteira";
import Rastreador from "../pages/PowerBI/Maps";
import Petrac from "../pages/PowerBI/Petrac"
import Pendente from "../pages/Pendente";


const DefaultLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

export default function RoutsPage() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout com Navbar visível em todas as rotas válidas */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/geral" element={<Geral />} />
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/rastreador" element={<Rastreador/>} />
          <Route path="/download" element={<Download/>} />
          <Route path="/ptrac" element={<Petrac/>} />
          <Route path="/pendente" element={<Pendente/>} />
        </Route>

        {/* Qualquer outra rota totalmente inválida */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
