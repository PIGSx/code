// src/App.js
import React from "react";
import Footer from "./components/Footer";
import "./index.css";
import RoutsPage from "./router";

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <RoutsPage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
