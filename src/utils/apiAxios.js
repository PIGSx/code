// src/utils/apiAxios.js

import axios from "axios";

// ===================================
// 🔥 API LOCAL (FastAPI)
// ===================================
const API_URL = "http://127.0.0.1:8000";

// ===================================
// ✅ Instância Axios
// ===================================
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
});

// ===================================
// 🔐 Request interceptor
// - Injeta token automaticamente
// - Trata FormData corretamente
// ===================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    // ✅ adiciona token automaticamente
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ FormData → NÃO definir Content-Type
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===================================
// 🔒 Response interceptor
// - 401 → logout automático
// - 403 → acesso negado
// ===================================
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const status = error.response.status;

      // ===================================
      // 🚫 TOKEN INVÁLIDO / EXPIRADO
      // ===================================
      if (status === 401) {
        console.warn("Sessão expirada ou token inválido");

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("token_exp");

        window.location.href = "/login";
      }

      // ===================================
      // 🚫 SEM PERMISSÃO
      // ===================================
      if (status === 403) {
        console.warn(
          "Acesso negado:",
          error.response.data?.detail
        );
      }
    }

    // ===================================
    // ⏱️ Timeout
    // ===================================
    else if (error.code === "ECONNABORTED") {
      console.error("Timeout da requisição");
    }

    // ===================================
    // ❌ API OFFLINE
    // ===================================
    else {
      console.error("Servidor indisponível");
    }

    return Promise.reject(error);
  }
);

// ===================================
// EXPORTS
// ===================================
export default api;
export { API_URL };