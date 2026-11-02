// In-memory access token storage (never persisted to localStorage or sessionStorage)
let accessToken = null;
let expiresAt = null;

export const setToken = (token, expiresInSeconds = 900) => {
  accessToken = token;
  expiresAt = token ? Date.now() + expiresInSeconds * 1000 : null;
};

export const getToken = () => accessToken;

export const getExpiresAt = () => expiresAt;

export const clearToken = () => {
  accessToken = null;
  expiresAt = null;
};

export const isTokenExpiringSoon = (leadTimeSeconds = 60) => {
  if (!accessToken || !expiresAt) return true;
  return Date.now() >= expiresAt - leadTimeSeconds * 1000;
};

