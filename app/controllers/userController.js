// app/controllers/userController.js
import { deleteUser as deleteUserModel } from "../models/user";
import { createUser as createUserModel } from "../models/user.js";
import { updateUser as updateUserModel } from "../models/user.js";
import { createUserWithProvider as createUserWithProviderModel } from "../models/user.js";

{
  /* MÉTODO PARA AÑADIR USUARIO */
}
export const createUser = async (req, res) => {
  try {
    const { email, username, red } = req.body;

    if (!email || !username) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios (email, username)" });
    }

    const result = await createUserModel({ email, username, red });

    return res.status(201).json({ success: true, user: result });
  } catch (err) {
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
};

{
  /* MÉTODO PARA ACTUALIZAR USUARIO*/
}
export const updateUser = async (req, res) => {
  try {
    const { uid, email } = req.body;

    if (!uid || !email) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios (uid, email)" });
    }

    const updatedUser = await updateUserModel(uid, email);
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    return res.status(500).json({ error: "Error al actualizar usuario" });
  }
};

{
  /* MÉTODO PARA BORRAR USUARIO*/
}
export const deleteUser = async (req, res) => {
  try {
    const { uid } = req.query;

    if (!uid) {
      return res.status(400).json({ error: "Falta el parámetro UID" });
    }

    const result = await deleteUserModel(uid);
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

{
  /* MÉTODO PARA AÑADIR USUARIO POR PROVEEDOR*/
}
export const createUserWithProvider = async (req, res) => {
  try {
    const { id, email, username, red } = req.body;

    if (!id || !email || !username) {
      return res.status(400).json({ error: "Faltan campos obligatorios (id, email, username)" });
    }

    const result = await createUserWithProviderModel({ id, email, username, red });

    if (result.exists) {
      return res.status(200).json({ success: false, error: "El usuario ya está registrado." });
    }

    return res.status(201).json({ success: true, user: result });
  } catch (err) {
    return res.status(500).json({ error: "Error al registrar usuario con proveedor" });
  }
};

