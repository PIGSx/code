// utils/api.js

const hostname = window.location.hostname;

// Detecta ambiente local
const isLocal =
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname.startsWith("192.168.");

// Troque pelo seu IP local (para desenvolvimento)
const LOCAL_API = "http://192.168.15.36:5000";

// Produção (servidor público)
const PROD_API = "https://api.technoblade.shop";

// URL final
const API_URL = isLocal ? LOCAL_API : PROD_API;

export default API_URL;
