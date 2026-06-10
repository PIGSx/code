// src/context/NotificationContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const fetchCount = () => {
    if (!isAuthenticated()) {
      setCount(0);
      setLoading(false);
      return;
    }

    // Temporário:
    // Ainda não existe backend de notificações
    setCount(0);
    setLoading(false);
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useEffect(() => {
    fetchCount();
  }, [location.pathname]);

  return (
    <NotificationContext.Provider
      value={{
        count,
        setCount,
        fetchCount,
        loading,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}