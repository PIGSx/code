// src/App.js
import React from "react";
import Footer from "./components/Footer";
import "./index.css";
import RoutsPage from "./router";

import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

import ThemeToggle from "./components/ThemeToggle";

function App() {
  return (
    <NotificationProvider>
      <ThemeProvider>
        <div className="flex flex-col min-h-screen bg-white dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-black dark:text-gray-100 transition-colors duration-300">
          <main className="flex-grow">
            <RoutsPage />
          </main>

          {/* Botão flutuante de tema */}
          <ThemeToggle />
        </div>

        <Footer />
      </ThemeProvider>
    </NotificationProvider>
  );
}

export default App;
