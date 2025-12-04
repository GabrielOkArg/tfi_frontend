//import { useNavigate } from "react-router-dom";

import { login } from "../api/authService";
//import type { LoginRequest } from "../api/authService";

const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true;

    try {
        // Un JWT tiene 3 partes separadas por puntos
        const [, payloadBase64] = token.split(".");

        // Reemplazo para manejar padding del base64
        const payload = JSON.parse(atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/")));

        // exp viene en segundos
        const currentTime = Math.floor(Date.now() / 1000);

        return payload.exp < currentTime;
    } catch (error) {
        console.error("Error decodificando token:", error);
        return true; // Si falla, lo tratamos como inválido
    }
};


export const authService = {

    loginUser :async (email:string, password:string) => {
        const result = await login({email, password});

        localStorage.setItem("token", result.token);
        localStorage.setItem("nombre", result.nombre);
        localStorage.setItem("role", result.rol);
        return result;
    },

    logout : () => {
        localStorage.clear();
    },
     isAuthenticated: (): boolean => {
        const token = localStorage.getItem("token");
        return !isTokenExpired(token);
    }
}