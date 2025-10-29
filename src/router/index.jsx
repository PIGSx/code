import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Download from "../pages/DownloadPage";
import PageNotFound from "../components/PageNotFound";
import Carteira from "../pages/PowerBI/Carteira";
import Rastreador from "../pages/PowerBI/Maps";
import Petrac from "../pages/PowerBI/Petrac"
import Pendente from "../pages/Pendente";
import Materiais from "../pages/Materiais";
import Polos from "../pages/Polos"
import Itaim from "../pages/PowerBI/Polos/Itaim";
import Penha from "../pages/PowerBI/Polos/Penha";
import SM from "../pages/PowerBI/Polos/SM";
import MateriaisList from "../pages/Materiais/MateriaisList";
import MateriaisApp from "../pages/Materiais/MateriaisApp";


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
          <Route path="/carteira" element={<Carteira />} />
          <Route path="/rastreador" element={<Rastreador/>} />
          <Route path="/download" element={<Download/>} />
          <Route path="/ptrac" element={<Petrac/>} />
          <Route path="/pendente" element={<Pendente/>} />
          <Route path="/materiais" element={<Materiais/>} />
          <Route path="/polos" element={<Polos/>} />
          <Route path="/itaim" element={<Itaim/>} />
          <Route path="/penha" element={<Penha/>} />
          <Route path="/sm" element={<SM/>} />
          <Route path="/materiaislist" element={ <MateriaisList/> } />
          <Route path="/materiaisapp" element={ <MateriaisApp/> } />
        </Route>

        {/* Qualquer outra rota totalmente inválida */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
