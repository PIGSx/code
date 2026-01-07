// src/utils/apiAxios.js
import axios from "axios";

// ===================================
// 🔍 Detecta ambiente automaticamente
// ===================================
const hostname = window.location.hostname;

let API_URL;
if (
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.")
) {
  API_URL = "http://127.0.0.1:5055";
} else {
  API_URL = "https://api.technoblade.shop";
}

// ===================================
// ✅ Instância Axios
// ===================================
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // ⏱️ 2 minutos (Selenium pode demorar)
});

// ===================================
// 🔐 Request interceptor
// - Injeta token automaticamente
// - Trata FormData corretamente
// ===================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🔥 FormData → NÃO setar Content-Type
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
// - 401 → token inválido → logout
// - 403 → permissão / regra de negócio (NÃO desloga)
// ===================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // 🚫 TOKEN INVÁLIDO / EXPIRADO
      if (status === 401) {
        console.warn("Sessão expirada ou token inválido");

        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        localStorage.removeItem("token_exp");

        if (window.pauseExibicao) {
          window.pauseExibicao();
        }

        window.location.href = "/login";
      }

      // 🚧 403 → apenas bloqueia ação
      if (status === 403) {
        console.warn("Acesso negado:", error.response.data?.detail);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("⏱️ Timeout da requisição");
    } else {
      console.error("❌ Erro de rede ou servidor indisponível");
    }

    return Promise.reject(error);
  }
);

// ===================================
// Exporta
// ===================================
export default api;
export { API_URL };
