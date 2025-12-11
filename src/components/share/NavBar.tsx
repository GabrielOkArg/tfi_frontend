import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { useState } from "react";
import useAuth from "../../hook/useAthu";

const Navbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
console.log(user)
  if (!user) return null; // si no está logueado no mostramos nada

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleMenuClose();
  };

  const getLinksByRole = () => {
    switch (user.rol) {
      case "admin":
        return (
          <>
            <Button color="inherit" onClick={() => handleNavigate("/reclamos")}>
              Reclamos
            </Button>
            <Button color="inherit" onClick={() => handleNavigate("/areas")}>
              Áreas
            </Button>
             <Button color="inherit" onClick={() => handleNavigate("/reporte")}>
              Reporte
            </Button>
            <Button color="inherit" onClick={() => handleNavigate("/usuarios")}>
              Usuarios
            </Button>
          </>
        );
      case "tecnico":
        return (
          <Button color="inherit" onClick={() => handleNavigate("/reclamostecnico")}>
            Reclamos
          </Button>
        );
      case "user":
        return (
          <Button
            color="inherit"
            onClick={() => handleNavigate("/mis-reclamos")}
          >
            Mis Reclamos
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          Gestión Reclamos
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          {getLinksByRole()}
        </Box>

        <Box sx={{ marginLeft: 3 }}>
          <Button
            onClick={handleMenuOpen}
            color="inherit"
            startIcon={
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: "secondary.main",
                  cursor: "pointer",
                }}
              >
                {user.nombre.charAt(0).toUpperCase()}
              </Avatar>
            }
          >
            {user.nombre}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem disabled>
              <Typography variant="body2">
                Rol: {user.rol.toUpperCase()}
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
