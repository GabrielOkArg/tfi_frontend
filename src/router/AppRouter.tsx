// import React, { type JSX } from "react";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Login from "../pages/Login/Login";
// // import Dashboard from "../pages/Dashboard/Dashboard";
// // import Areas from "../pages/Areas/Areas";
// // import Reclamos from "../pages/Reclamos/Reclamos";
// import MainLayout from "../components/layouts/MainLayout";

// export default function AppRouter() {
//   const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
//     const token = localStorage.getItem("token");
//     return token ? (children as JSX.Element) : <Navigate to="/login" />;
//   };

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<Login />} />

//         <Route
//           path="/"
//           element={
//             <PrivateRoute>
//               <MainLayout />
//             </PrivateRoute>
//           }
//         >
//           {/* <Route index element={<Dashboard />} />
//           <Route path="areas" element={<Areas />} />
//           <Route path="reclamos" element={<Reclamos />} /> */}
//         </Route>
//       </Routes>
//     </BrowserRouter>
//   );
// }
import {  Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../components/layouts/MainLayout";
import HomePage from "../pages/HomePage";
import {PrivateRoute} from "./PrivateRoute";
import { Reclamos } from "../pages/admin/Reclamos";
import Usuarios from "../pages/admin/Usuarios";
import { Areas } from "../pages/admin/Areas";
import  MisReclamos  from "../pages/user/MisReclamos";
import { Reportes } from "../pages/admin/Reportes";

export default function AppRouter() {
  return (
   
      <Routes>

        <Route path="/login" element={<Login />} />

        {/* Rutas privadas */}
        <Route >
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="areas" element={
              <PrivateRoute>
                <Areas />
              </PrivateRoute>
            } />
            <Route path="reclamos"  element={
              <PrivateRoute>
                <Reclamos />
              </PrivateRoute>
            }  />
            <Route path="usuarios"  element={
              <PrivateRoute>
                <Usuarios />
              </PrivateRoute>
            }  />
            <Route path="mis-reclamos"  element={
              <PrivateRoute>
                <MisReclamos />
              </PrivateRoute>
            }  />
              <Route path="reporte"  element={
              <PrivateRoute>
                <Reportes />
              </PrivateRoute>
            }  />
          </Route>
        </Route>

      </Routes>
   
  );
}
