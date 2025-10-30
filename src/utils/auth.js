// src/utils/auth.js

// === Chaves ===
const TOKEN_KEY = "token";
const USER_KEY = "username";
const ROLE_KEY = "role";
const EXP_KEY = "token_exp"; // expiração em timestamp

// === Funções básicas ===
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => localStorage.getItem(USER_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);

// === Salva dados de login ===
export const setAuth = (token, username, role, ttlHours = 8) => {
  const exp = Date.now() + ttlHours * 60 * 60 * 1000; // expiração padrão: 8h
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(EXP_KEY, exp);
};

// === Verifica se o token ainda é válido ===
export const isAuthenticated = () => {
  const token = getToken();
  const exp = localStorage.getItem(EXP_KEY);

  if (!token) return false;
  if (exp && Date.now() > Number(exp)) {
    clearAuth(); // token expirado → logout automático
    return false;
  }
  return true;
};

// === Headers para API ===
export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === Limpa tudo ===
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EXP_KEY);
};
