import { useForm } from "react-hook-form";
import { Box, Button, Card, TextField, Typography, Container, Stack } from "@mui/material";
import  useAuth  from "../../hook/useAthu";
import toast from "react-hot-toast";
import { useSpinner } from "../../components/share/context/SpinnerContext";
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const { login } = useAuth();
  const { showSpinner, hideSpinner } = useSpinner();
  //const navigate = useNavigate();

  // Redirigir si ya está autenticado
  // useEffect(() => {
  //   if (user) {
  //     navigate("/", { replace: true });
  //   }
  // }, [user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      showSpinner();
      await login(data.email,data.password);
    } catch (err: any) {
     toast.error("Error al iniciar sesión");
    }finally{
        hideSpinner();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        background: "linear-gradient(135deg, #2B579A 0%, #0078D4 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: 4,
            minHeight: "90vh",
          }}
        >
          {/* Panel de Bienvenida */}
          <Box
            sx={{
              flex: { md: "1 1 60%" },
              color: "white",
              pr: { md: 4 },
            }}
          >
            <Typography 
              variant="h2" 
              fontWeight="bold" 
              gutterBottom
              sx={{ 
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
              }}
            >
              Bienvenido a SGIR
            </Typography>
            
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 4,
                opacity: 0.95,
                fontSize: { xs: "1.2rem", md: "1.5rem" }
              }}
            >
              Sistema de Gestión Integral de Reclamos
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                fontSize: "1.1rem",
                lineHeight: 1.8,
                opacity: 0.9
              }}
            >
              Gestiona todos tus reclamos de manera eficiente y centralizada. 
              Una plataforma moderna diseñada para optimizar la atención y seguimiento 
              de solicitudes.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={3}
              sx={{ mt: 4 }}
            >
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <AssignmentIcon sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Organización
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Control total de reclamos
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <SpeedIcon sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Eficiencia
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Respuestas rápidas
                </Typography>
              </Box>
              
              <Box sx={{ flex: 1, textAlign: "center" }}>
                <SecurityIcon sx={{ fontSize: 50, mb: 1 }} />
                <Typography variant="h6" fontWeight="bold">
                  Seguridad
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Datos protegidos
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Panel de Login */}
          <Box
            sx={{
              flex: { md: "1 1 40%" },
              width: { xs: "100%", sm: "400px", md: "auto" },
            }}
          >
            <Card 
              sx={{ 
                p: 4, 
                boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                borderRadius: 3,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(255,255,255,0.95)"
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Box sx={{ textAlign: "center" }}>
                  <AssignmentIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                  <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                    SGIR
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ingresa tus credenciales para continuar
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email"
                      fullWidth
                      type="email"
                      {...register("email")}
                      required
                    />

                    <TextField
                      label="Contraseña"
                      type="password"
                      fullWidth
                      {...register("password")}
                      required
                    />

                    <Button 
                      type="submit" 
                      variant="contained" 
                      fullWidth
                      size="large"
                      sx={{ 
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "bold",
                        textTransform: "none",
                        mt: 1
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  </Stack>
                </form>

                <Typography 
                  variant="caption" 
                  display="block" 
                  textAlign="center" 
                  sx={{ color: "text.secondary" }}
                >
                  © 2025 SGIR - Todos los derechos reservados
                </Typography>
              </Stack>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
