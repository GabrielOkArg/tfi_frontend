import Box from "@mui/material/Box";
import { useSpinner } from "./context/SpinnerContext";
import CircularProgress from "@mui/material/CircularProgress";
//import CircularProgress from '@mui/material/CircularProgress';
//import Box from '@mui/material/Box';



export const Spinner = () => {
  const { isVisible } = useSpinner();

  if (!isVisible) return null;

  return (
    <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo grisado con transparencia
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1300, // Asegura que esté por delante de todo
    }}>
        <CircularProgress />

    </Box>
    
  );
};
