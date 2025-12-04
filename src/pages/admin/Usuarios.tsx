import { useState } from "react";
import { useSpinner } from "../../components/share/context/SpinnerContext";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
 
} from "@mui/material";
import { userService } from "../../service/userService";
import toast from "react-hot-toast";

export const Usuarios = () => {
  const { showSpinner, hideSpinner } = useSpinner();

  const [openCreate, setOpenCreate] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "1234",
    rol: "",
  });

  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  const openModal = () => setOpenCreate(true);
  const closeModal = () => {
    setOpenCreate(false);
    setErrors({});
  };

  const handleChange = (field: string, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!newUser.nombre) e.nombre = "Nombre es requerido";
    if (!newUser.email) e.email = "Email es requerido";
    if (!newUser.rol) e.rol = "Rol es requerido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      showSpinner?.();
      // Aquí puedes integrar el service: p.ej. await usersService.create(newUser)
      console.log("Crear usuario (stub):", newUser);
      const response = await userService.create(newUser);
      console.log("Usuario creado:", response);
      // Simular éxito: cerrar modal y resetear formulario
      closeModal();
      toast.success("Usuario creado exitosamente");
      setNewUser({ nombre: "", email: "", password: "1234", rol: "" });
    } catch (err) {
      console.error("Error creando usuario:", err);
    } finally {
        toast.error("Error al crear usuario");
      hideSpinner?.();
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        
        <Button variant="contained" color="primary" onClick={openModal}>
          Crear usuario
        </Button>
      </Stack>

      <Dialog open={openCreate} onClose={closeModal} fullWidth maxWidth="sm">
        <DialogTitle>Crear Usuario</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Nombre"
              value={newUser.nombre}
              onChange={(e) => handleChange("nombre", e.target.value)}
              error={!!errors.nombre}
              helperText={errors.nombre}
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={newUser.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
              fullWidth
            />

           
            <FormControl fullWidth size="small">
              <InputLabel id="rol-label">Rol</InputLabel>
              <Select
                labelId="rol-label"
                value={newUser.rol}
                label="Rol"
                onChange={(e) => handleChange("rol", e.target.value as string)}
                error={!!errors.rol}
              >
                <MenuItem value="admin">admin</MenuItem>
                <MenuItem value="tecnico">tecnico</MenuItem>
                <MenuItem value="user">user</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleCreate}>
            Crear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Usuarios;
