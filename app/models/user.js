// app/models/user.js
import { db, getAuth, resend } from "../lib/firebaseAdmin";

export const createUser = async ({ email, username, red }) => {
  const userRef = db.collection("users").doc();
  const userId = userRef.id;
  const createdAt = new Date();

  await userRef.set({
    id: userId,
    email,
    username,
    red,
    createdAt,
    discountStatus: false,
  });

  // Mandar correo de bienvenida
  await sendEmail(email, username);

  return { id: userId, email, username, red, createdAt };
};

export const updateUser = async (uid, email) => {
  const userRef = db.collection("users").doc(uid);
  const docSnap = await userRef.get();

  if (!docSnap.exists) {
    throw new Error("Usuario no encontrado");
  }

  await userRef.update({ email });
  return { id: uid, email };
};

export const deleteUser = async (uid) => {
  try {
    const userRef = db.collection("users").doc(uid);
    await userRef.delete();

    const auth = getAuth();
    await auth.deleteUser(uid);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createUserWithProvider = async ({ id, email, username, red }) => {
  const createdAt = new Date();

  const userRef = db.collection("users").doc(id);
  const doc = await userRef.get();

  if (doc.exists) {
    return { exists: true };
  }

  await userRef.set({
    id,
    email,
    username,
    red,
    createdAt,
    discountStatus: false,
  });

  await sendEmail(email, username);

  return { id, email, username, red, createdAt, exists: false };
};

export const updateDiscountStatus = async (uid, discountStatus) => {
  const userRef = db.collection("users").doc(uid);
  const docSnap = await userRef.get();

  if (!docSnap.exists) {
    throw new Error("Usuario no encontrado");
  }

  await userRef.update({ discountStatus });
  return { id: uid, discountStatus };
};

const sendEmail = async (email, username) => {
  try {
    const htmlContent = `
      <html>
        <body style="margin:0; padding:0; background-color:#f2f2f2;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center" style="padding:40px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background:#ffffff; border-radius:8px; overflow:hidden;">
                  <tr>
                    <tr>
                      <td style="background-color:#5CB3FF; padding:20px; text-align:center; text-decoration:none;">
                    <a href="#">
                      <img src="https://i.imgfly.me/sYuqdf.png" alt="mwv" border="0" width="50" style="display:block; margin:0 auto; border-radius:50%;">
                    </a>
                        <h1 style="color:#ffffff; margin:0;">¡Bienvenido!</h1>
                      </td>
                    </tr>
                  </tr>
                  <tr>
                    <td style="padding:30px; text-align:center;">
                      <p style="font-size:18px; color:#333333; margin-bottom:20px;">
                        Hola, <strong>${username}</strong> 👋
                      </p>
                      <p style="font-size:16px; color:#555555; line-height:1.5;">
                        ¡Gracias por registrarte con nosotros! Como muestra de agradecimiento, has obtenido un <strong>5% de descuento</strong> en tu próxima visita a nuestra cafetería.
                      </p>
                      <p style="font-size:16px; color:#555555; margin-top:20px;">
                        Solo muestra este correo en caja para aprovechar tu beneficio. ☕✨
                      </p>
                      <div style="margin-top:30px;">
                        <a href="#" style="background-color:#5CB3FF; color:#ffffff; padding:12px 24px; text-decoration:none; font-size:16px; border-radius:6px;">
                          Visítanos pronto
                        </a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color:#f9f9f9; padding:20px; text-align:center; font-size:12px; color:#999999;">
                      © 2025 Moonwave. Todos los derechos reservados.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "¡Gracias por registrarte!",
      html: htmlContent,
    });

  } catch (error) {
  }
};
