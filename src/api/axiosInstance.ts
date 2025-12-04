import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:44332/api", // tu backend
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

export default api;
