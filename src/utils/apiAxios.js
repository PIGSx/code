// src/utils/apiAxios.js
import axios from "axios";

// 🔍 Detecta ambiente automaticamente
const hostname = window.location.hostname;

// 🧩 Decide o backend correto
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

// ✅ Cria instância Axios SEM Content-Type fixo
const api = axios.create({
  baseURL: API_URL,
});

// ✅ Token automático
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 Se for FormData, NÃO definir Content-Type
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    // JSON normal
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

// 🔐 Interceptor de segurança
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.removeItem("token");

      if (window.pauseExibicao) {
        window.pauseExibicao();
      }

      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
