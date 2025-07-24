import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Geral from "../pages/PowerBI/Geral";
import PageNotFound from "../components/PageNotFound";

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
        </Route>

        {/* Qualquer outra rota totalmente inválida */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
