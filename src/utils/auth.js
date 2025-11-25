// src/utils/auth.js

// === Chaves ===
const TOKEN_KEY = "token";
const USER_KEY = "username";
const ROLE_KEY = "role";
const EXP_KEY = "token_exp"; // expiração em timestamp

// === Funções ===
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = () => localStorage.getItem(USER_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);

// === Salva dados de login ===
export const setAuth = (token, username, role, ttlHours = 8) => {
  try {
    const exp = Date.now() + ttlHours * 60 * 60 * 1000;

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, username);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(EXP_KEY, exp.toString());
  } catch (err) {
    console.error("Erro ao salvar auth:", err);
  }
};

// === Verifica se o token ainda é válido ===
export const isAuthenticated = () => {
  try {
    const token = getToken();
    const exp = localStorage.getItem(EXP_KEY);

    // Sem token → não logado
    if (!token) return false;

    // Falha ao ler expiração → força logout
    if (!exp || isNaN(Number(exp))) {
      clearAuth();
      return false;
    }

    // Token expirado
    if (Date.now() > Number(exp)) {
      clearAuth();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    clearAuth();
    return false;
  }
};

// === Headers padrão para chamadas de API ===
export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === Limpa tudo ===
export const clearAuth = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(EXP_KEY);
  } catch (err) {
    console.error("Erro ao limpar auth:", err);
  }
};
