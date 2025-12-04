// import { useNavigate } from "react-router-dom";
// import { login } from "../api/authService";
// import type { LoginRequest } from "../api/authService";


// export const useAuth = () => {
//   const navigate = useNavigate();

//   const loginUser = async (data: LoginRequest) => {
//     const result = await login(data);

//     localStorage.setItem("token", result.token);
//     localStorage.setItem("nombre", result.nombre);
//     localStorage.setItem("role", result.role);

//     navigate("/");
//   };

//   const logout = () => {
//     localStorage.clear();
//     navigate("/login");
//   };

//   return { loginUser, logout };
// };

import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"


const useAuth = () => {
    const {login,logout,user} = useContext(AuthContext)!;
    return{
        login,
        logout,
        user
    }
}
export default useAuth;