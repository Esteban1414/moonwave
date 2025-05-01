import React, { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { Typography } from "@mui/material";
import NotFound from "./404";
import { getLoginIntent } from "../utils/authIntent";

const Auth = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [unauthorized, setUnauthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const intent = getLoginIntent();
        if (!intent) {
          setUnauthorized(true);
          return;
        }

        const res = await fetch("/api/session");

        if (!res.ok) throw new Error("No autorizado");

        const data = await res.json();
        setUnauthorized(!data.authenticated);
      } catch (err) {
        console.clear();
        setUnauthorized(true);
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Cargando...
        </Typography>
        <CircularProgress size={60} sx={{ color: "#00ADB5" }} />
      </Box>
    );
  }

  if (unauthorized) {
    return <NotFound />;
  }

  return children;
};

export default Auth;
