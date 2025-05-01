// app/models/auth.js
import bcrypt from "bcryptjs";

export const loginAuth = async (email, password) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = process.env.ADMIN_PASSWORD_HASH;

    if (email !== adminEmail) {
      return false;
    }

    return await bcrypt.compare(password, adminHash);
  } catch (err) {
    return false;
  }
};
