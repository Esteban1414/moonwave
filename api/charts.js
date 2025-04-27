import { fetchUserStats } from "../app/controllers/chartController";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return fetchUserStats(req, res);
  } else {
    return res.status(405).json({ error: "Método no permitido" });
  }
}
