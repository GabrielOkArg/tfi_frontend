// import { Navigate, Outlet } from "react-router-dom";

// const PrivateRoute = () => {
//   const token = localStorage.getItem("token");
//   return token ? <Outlet /> : <Navigate to="/login" replace />;
// };

// export default PrivateRoute;
// import { Navigate } from "react-router-dom";
// import { authService } from "../service/authService";
// import type { JSX } from "react";

// export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
//     if (!authService.isAuthenticated()) {
//         authService.logout();
//         return <Navigate to="/login" replace />;
//     }

//     return children;
// };
import { Navigate } from "react-router-dom";
import { useContext, type JSX } from "react";
import { AuthContext } from "../context/AuthContext";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const auth = useContext(AuthContext);

  // Mientras carga el AuthProvider → evita parpadeo
  if (auth?.loading) return null;

  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
