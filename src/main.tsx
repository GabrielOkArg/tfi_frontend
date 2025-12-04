import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme/theme.ts";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.tsx";
import { Toaster } from "react-hot-toast";
import { SpinnerProvider } from "./components/share/context/SpinnerContext.tsx";
import { Spinner } from "./components/share/Spinner.tsx";

createRoot(document.getElementById("root")!).render(
 <BrowserRouter>
    <ThemeProvider theme={theme}>
      <StrictMode>
        <SpinnerProvider>
          <AuthProvider>
            <Spinner />
            <App />
            <Toaster position="top-right" />
          </AuthProvider>
        </SpinnerProvider>
      </StrictMode>
    </ThemeProvider>
  </BrowserRouter>
);
