import { useForm } from "react-hook-form";
import { Box, Button, Card, TextField, Typography } from "@mui/material";
import  useAuth  from "../../hook/useAthu";
import toast from "react-hot-toast";
import { useSpinner } from "../../components/share/context/SpinnerContext";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function Login() {
  const { register, handleSubmit } = useForm<LoginFormValues>();
  const { login } = useAuth();
  const { showSpinner, hideSpinner } = useSpinner();

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
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        
      }}
    >
      <Card sx={{ p: 4, width: 350, bgcolor: "#0d6efd" }}>
        <Typography variant="h5" color="primary" textAlign="center" mb={3}>
          Iniciar sesión
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            fullWidth
            {...register("email")}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            {...register("password")}
            sx={{ mb: 3 }}
          />

          <Button type="submit" variant="contained" fullWidth>
            Entrar
          </Button>
        </form>
      </Card>
    </Box>
  );
}
