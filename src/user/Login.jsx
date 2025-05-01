import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Login as LoginIcon } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import { setLoginIntent } from "../utils/authIntent";


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleLogin = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error("No puede dejar campos vacíos");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Formato de correo inválido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword }),
      });

      if (!res.ok) {
        console.clear();
        toast.error(res.status === 401 ? "Credenciales inválidas" : "Credenciales inválidas");
        return;
      }
      
      setLoginIntent(); 
      navigate("/admin");

    } catch (err) {
      console.clear();
      toast.error("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#0A0E17",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <ToastContainer />
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#FFF9ED",
          borderRadius: 3,
          boxShadow: 6,
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Avatar
            src="https://i.imgfly.me/sYuqdf.png"
            alt="Logo"
            sx={{ width: 80, height: 80, mx: "auto", mb: 1 }}
          />
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2D3748" }}>
            Inicia Sesión
          </Typography>
          <Typography variant="body2" sx={{ color: "#4A5568", mt: 1 }}>
            Accede con tus credenciales
          </Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiInputBase-root": {
                color: "#2D3748",
                backgroundColor: "#2176AE",
              },
              "& .MuiInputLabel-root": {
                color: "#2D3748",
              },
            }}
          />

          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiInputBase-root": {
                color: "#2D3748",
                backgroundColor: "#2176AE",
              },
              "& .MuiInputLabel-root": {
                color: "#2D3748",
              },
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              backgroundColor: "#FFA22E",
              color: "#FFFFFF",
              fontWeight: "bold",
              py: 1.5,
              "&:hover": {
                backgroundColor: "#E69100",
              },
            }}
            startIcon={!loading && <LoginIcon />}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#5CB3FF" }} />
            ) : (
              "Entrar"
            )}
            {/* Se puede meter gifs de MWV, ejemplo:*/}
            {/* <img src="/ruta/.gif" alt="Cargando..." width={24} height={24} /> */}

          </Button>

        </form>
      </Box>
    </Box>
  );
};

export default Login;
