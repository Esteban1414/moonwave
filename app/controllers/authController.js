// app/controllers/authController.js
import { loginAuth as loginAuthModel } from "../models/auth";
import { serialize } from "cookie";

export const loginAuth = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    const valid = await loginAuthModel(email, password);

    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const cookie = serialize("token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 día
      path: "/",
    });

    res.setHeader("Set-Cookie", cookie);

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
