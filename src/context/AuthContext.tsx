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
    toast.success("Sesión cerrada correctamente");
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








// import { createContext, useState, useEffect, type ReactNode } from "react";
// import { authService } from "../service/authService";
// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";

// interface UserContext {
//   nombre: string;
//   rol: string;
//   userId?: string | number;
// }

// interface AuthContextType {
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   user: UserContext | null;
//   loading: boolean;
// }

// export const AuthContext = createContext<AuthContextType | null>(null);

// // 🔹 Decodificar JWT
// const parseJwt = (token: string | null) => {
//   if (!token) return null;
//   try {
//     const parts = token.split(".");
//     if (parts.length < 2) return null;
//     let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
//     const json = decodeURIComponent(
//       atob(base64)
//         .split("")
//         .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
//         .join("")
//     );
//     return JSON.parse(json);
//   } catch (err) {
//     return null;
//   }
// };

// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [userContext, setUserContext] = useState<UserContext | null>(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   // 🔹 Reconstruir usuario al iniciar o refrescar
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     const payload = parseJwt(token);

//     // 🔹 Si el token es inválido → limpiar
//     if (!payload) {
//       authService.logout();
//       setLoading(false);
//       return;
//     }

//     // 🔹 Validar expiración
//     const now = Math.floor(Date.now() / 1000);
//     if (payload.exp && payload.exp < now) {
//       authService.logout();
//       setLoading(false);
//       return;
//     }

//     // 🔹 Reconstruir userContext seguro
//     const userId = payload.id ?? payload.sub ?? payload.userId ?? payload.uid ?? null;
//     const rol =
//       localStorage.getItem("role") ??
//       payload.role ??
//       payload.rol ??
//       payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
//       null;
//     const nombre = localStorage.getItem("nombre") ?? payload.name ?? payload.sub ?? null;

//     if (userId && nombre && rol) {
//       setUserContext({ userId, nombre, rol });
//       localStorage.setItem("userId", String(userId));
//     } else {
//       authService.logout();
//       console.warn("❌ No se pudo reconstruir userContext");
//     }

//     setLoading(false);
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const result = await authService.loginUser(email, password);

//       const tokenFromStorage = localStorage.getItem("token") || (result as any)?.token || null;
//       const payload = parseJwt(tokenFromStorage);
//       const userId = payload?.id ?? payload?.sub ?? payload?.userId ?? payload?.uid ?? null;

//       // 🔹 Guardar en localStorage
//       if (!tokenFromStorage || !userId) throw new Error("Token inválido");

//       localStorage.setItem("token", tokenFromStorage);
//       localStorage.setItem("nombre", result.nombre);
//       localStorage.setItem("role", result.rol);
//       localStorage.setItem("userId", String(userId));

//       setUserContext({
//         nombre: result.nombre,
//         rol: result.rol,
//         userId,
//       });

//       navigate("/");
//     } catch (error) {
//       toast.error("Credenciales incorrectas");
//       throw error;
//     }
//   };

//   const logout = () => {
//     toast.success("Sesión cerrada correctamente");
//     authService.logout();
//     setUserContext(null);
//     navigate("/login");
//   };

//   // 🔹 Mientras reconstruye el usuario → no renderiza rutas
//   if (loading) return null;

//   return (
//     <AuthContext.Provider value={{ login, logout, user: userContext, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
