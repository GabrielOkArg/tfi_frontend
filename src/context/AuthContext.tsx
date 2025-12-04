import { createContext, useState, useEffect, type ReactNode } from "react";
import { authService } from "../service/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

interface UserContext {
  nombre: string;
  rol: string;
  userId?: string | number;
}

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user: UserContext | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Helper: decode JWT payload (safe for URL-safe base64)
const parseJwt = (token: string | null) => {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1];
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔥 reconstruir usuario al iniciar la app o refrescar
  useEffect(() => {
    const token = localStorage.getItem("token");
    const nombre = localStorage.getItem("nombre");
    const rol = localStorage.getItem("role");

    if (token && nombre && rol) {
      const payload = parseJwt(token);
      const userId = payload?.userId ?? payload?.id ?? payload?.sub ?? payload?.uid ?? null;
      if (userId) localStorage.setItem("userId", String(userId));
      setUserContext({ nombre, rol, userId });
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.loginUser(email, password);

      // token may be stored by the authService in localStorage, or returned in result
      const tokenFromStorage = localStorage.getItem("token") || (result as any)?.token || null;
      const payload = parseJwt(tokenFromStorage);
      const userId = payload?.userId ?? payload?.id ?? payload?.sub ?? payload?.uid ?? null;
      if (userId) localStorage.setItem("userId", String(userId));

      setUserContext({
        nombre: result.nombre,
        rol: result.rol,
        userId,
      });

      navigate("/");
    } catch (error) {
      toast.error("Credenciales incorrectas");
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUserContext(null);
    navigate("/login");
  };

  if (loading) return null; // evita parpadeo

  return (
    <AuthContext.Provider value={{ login, logout, user: userContext, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
