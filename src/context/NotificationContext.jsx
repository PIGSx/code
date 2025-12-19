// src/context/NotificationContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/apiAxios";
import { isAuthenticated } from "../utils/auth";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCount = async () => {
    if (!isAuthenticated()) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/notifications/count");
      setCount(res.data?.count || 0);
    } catch (err) {
      console.error("Erro ao buscar notificações", err);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Busca inicial
  useEffect(() => {
    fetchCount();
  }, []);

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
