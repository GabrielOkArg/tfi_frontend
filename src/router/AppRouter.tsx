
// import {  Routes, Route, Navigate } from "react-router-dom";
// import Login from "../pages/Login/Login";
// import MainLayout from "../components/layouts/MainLayout";
// import HomePage from "../pages/HomePage";
// import {PrivateRoute} from "./PrivateRoute";
// import { Reclamos } from "../pages/admin/Reclamos";
// import Usuarios from "../pages/admin/Usuarios";
// import { Areas } from "../pages/admin/Areas";
// import  MisReclamos  from "../pages/user/MisReclamos";
// import { Reportes } from "../pages/admin/Reportes";
// import { authService } from "../service/authService";
// import { ReclamosTecnico } from "../pages/tecnico/Reclamos";

// export default function AppRouter() {
//   return (
   
//       <Routes>

//         <Route path="/login" element={<Login />} />

//         {/* Rutas privadas */}
//         <Route >
//           <Route element={<MainLayout />}>
//             <Route index element={
//               authService.isAuthenticated() ? <HomePage /> : <Navigate to="/login" replace />
//             } />
//             <Route path="areas" element={
//               <PrivateRoute>
//                 <Areas />
//               </PrivateRoute>
//             } />
//             <Route path="reclamos"  element={
//               <PrivateRoute>
//                 <Reclamos />
//               </PrivateRoute>
//             }  />
//             <Route path="usuarios"  element={
//               <PrivateRoute>
//                 <Usuarios />
//               </PrivateRoute>
//             }  />
//             <Route path="mis-reclamos"  element={
//               <PrivateRoute>
//                 <MisReclamos />
//               </PrivateRoute>
//             }  />
//               <Route path="reporte"  element={
//               <PrivateRoute>
//                 <Reportes />
//               </PrivateRoute>
//             }  />
//             <Route path="reclamostecnico"  element={
//               <PrivateRoute>
//                 <ReclamosTecnico />
//               </PrivateRoute>
//             }  />
//           </Route>
//         </Route>

//       </Routes>
   
//   );
// }



import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import MainLayout from "../components/layouts/MainLayout";
import HomePage from "../pages/HomePage";
import { PrivateRoute } from "./PrivateRoute";
import { Reclamos } from "../pages/admin/Reclamos";
import Usuarios from "../pages/admin/Usuarios";
import { Areas } from "../pages/admin/Areas";
import MisReclamos from "../pages/user/MisReclamos";
import { Reportes } from "../pages/admin/Reportes";
import { ReclamosTecnico } from "../pages/tecnico/Reclamos";

export default function AppRouter() {
  return (
    <Routes>
      {/* Ruta pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas privadas */}
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route index element={<HomePage />} />
        <Route path="areas" element={<Areas />} />
        <Route path="reclamos" element={<Reclamos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="mis-reclamos" element={<MisReclamos />} />
        <Route path="reporte" element={<Reportes />} />
        <Route path="reclamostecnico" element={<ReclamosTecnico />} />
      </Route>

      {/* Ruta catch-all: si no hay match, redirigir */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
