// src/utils/api.js
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
  // Ambiente local → usa backend local
  API_URL = "http://127.0.0.1:5050";
} else {
  // Ambiente de produção → usa o servidor online
  API_URL = "https://api.technoblade.shop";
}

// ✅ Cria instância Axios configurada
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Inclui token automaticamente, se existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
export { API_URL };
