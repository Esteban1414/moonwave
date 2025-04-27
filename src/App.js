import * as React from "react";
import { Routes, Route } from "react-router-dom";
import Box from "@mui/material/Box";

import Sidebar from "./admin/layouts/Sidebar";
import Navbar from "./admin/layouts/Navbar";
import Footer from "./admin/layouts/Footer";

import Dashboard from "./admin/pages/dashboard";
import Users from "./admin/pages/users";

import Home from "./user/index";
import NotFound from "./user/404";

const sideBarWidth = 250;

function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", flex: 1 }}>
        <Navbar sideBarWidth={sideBarWidth} handleDrawerToggle={handleDrawerToggle} />
        <Sidebar sideBarWidth={sideBarWidth} mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            px: { xs: 1, md: 2 },
            width: { xs: "100%", md: `calc(100% - ${sideBarWidth}px)` },
            display: "flex",
            flexDirection: "column",
            minHeight: "100%"
          }}
        >
          <Box sx={{ flex: 1 }}>
            {children}
          </Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}

function App() {

  return (
    <Routes>

      {/* Rutas para usuarios */}
      <Route path="/" element={<Home />} />

      {/* Ruta admin dashboard*/}
      <Route path="/admin/" element={<AdminLayout><Dashboard /></AdminLayout>} />

      {/* Ruta admin users*/}
      <Route path="/admin/usuarios/" element={<AdminLayout><Users /></AdminLayout>} />

      {/* Ruta 404*/}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;
