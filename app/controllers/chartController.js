import { getUserStats } from "../models/chart";

export const fetchUserStats = async (req, res) => {
  try {
    const data = await getUserStats();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error al obtener estadísticas" });
  }
};
