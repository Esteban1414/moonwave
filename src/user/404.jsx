import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#FFF9ED",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        component="img"
        src="https://i.imgfly.me/sYuqdf.png"
        alt="Logo MWV"
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          mb: 3,
        }}
      />
      <Typography variant="h3" sx={{ color: "#2D3748", mb: 2 }}>
        404 - Página no encontrada
      </Typography>
      <Typography variant="body1" sx={{ color: "#2D3748", mb: 4 }}>
        Lo sentimos, la página que estás buscando no existe o fue movida.
      </Typography>
      <Button
        component={Link}
        to="/"
        variant="contained"
        sx={{
          bgcolor: "#269AFE",
          ":hover": {
            bgcolor: "#0077CC",
          },
          color: "#FFFFFF",
          px: 4,
          py: 1.5,
          borderRadius: "8px",
          fontSize: "16px",
          textTransform: "none",
        }}
      >
        Volver al inicio
      </Button>
    </Box>
  );
};

export default NotFound;
