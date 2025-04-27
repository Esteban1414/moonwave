import { db } from "../lib/firebaseAdmin";

export const getUserStats = async () => {
  const snapshot = await db.collection("users").get();
  const now = new Date(); // Fecha actual en UTC

  const stats = {
    pagina: { oneDay: 0, threeDays: 0, oneWeekPlus: 0 },
    google: { oneDay: 0, threeDays: 0, oneWeekPlus: 0 },
    facebook: { oneDay: 0, threeDays: 0, oneWeekPlus: 0 },
  };

  snapshot.forEach((doc) => {
    const data = doc.data();
    
    const createdAt = data.createdAt?.toDate 
      ? data.createdAt.toDate() 
      : new Date(data.createdAt);
    
    if (isNaN(createdAt.getTime())) return;

    const diff = (now - createdAt) / (1000 * 60 * 60 * 24); 

    const category = 
      diff <= 1 ? "oneDay" : 
      diff <= 3 ? "threeDays" : 
      "oneWeekPlus";

    const red = data.red || "pagina"; 
    if (stats[red]) {
      stats[red][category]++;
    }
  });

  return stats;
};