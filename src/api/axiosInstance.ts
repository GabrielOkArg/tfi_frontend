import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: "https://localhost:44332/api", // tu backend
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) config.headers.Authorization = `Bearer ${token}`;

  return config;
});

// Interceptor para manejar errores de respuesta (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o no autorizado
      toast.error("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
