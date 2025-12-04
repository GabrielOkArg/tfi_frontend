import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Navbar from "../share/NavBar";

export default function MainLayout() {
    console.log("MainLayout SE MONTÓ");
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Navbar/>
        
      {/* <Drawer variant="permanent" sx={{ width: 240 }}>
        <Toolbar />
        <List>
          <ListItemButton component={Link} to="/">Dashboard</ListItemButton>
          <ListItemButton component={Link} to="/areas">Áreas</ListItemButton>
          <ListItemButton component={Link} to="/reclamos">Reclamos</ListItemButton>
        </List>
      </Drawer> */}

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
