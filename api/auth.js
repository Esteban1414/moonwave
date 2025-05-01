// api/auth.js
import { loginAuth } from "../app/controllers/authController";

export default async function handler(req, res) {
  if (req.method === "POST") {
    return await loginAuth(req, res);
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).json({ error: `Método ${req.method} no permitido` });
}