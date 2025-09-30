// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// set once on load (keeps your current behavior)
export function setDevUser({ id = "user-123", role = "USER" } = {}) {
  api.defaults.headers.common["x-user-id"] = id;
  api.defaults.headers.common["x-role"] = role;
  try { localStorage.setItem("devUser", JSON.stringify({ id, role })); } catch {}
}
try {
  const saved = JSON.parse(localStorage.getItem("devUser") || "null");
  saved ? setDevUser(saved) : setDevUser();
} catch { setDevUser(); }

// 👉 ensure headers are present on EVERY request
api.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem("devUser") || "null");
    if (saved?.id) {
      config.headers["x-user-id"] = saved.id;
      config.headers["x-role"] = saved.role;
    }
  } catch {}
  return config;
});

export default api;