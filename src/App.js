import React from "react";
import Footer from "./components/Footer";
import "./index.css";
import RoutsPage from "./router";
import { useLocation } from "react-router-dom";
import BotaoVoltar from "./components/BackBotton";

function App() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {!isHome && (
        <div className="p-4">
          <BotaoVoltar />
        </div>
      )}

      <main className="flex-grow">
        <RoutsPage />
      </main>

      <Footer />
    </div>
  );
}

export default App;
