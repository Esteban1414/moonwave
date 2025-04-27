import React from "react";
import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Box sx={{ pt: "80px", pb: "20px" }}>
        <h1>Página de inicio</h1>
        <Link to="/admin">Ir al panel de administración</Link>
    </Box>
  );
};

export default Home;
