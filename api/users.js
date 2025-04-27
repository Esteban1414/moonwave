import {
  deleteUser,
  createUser,
  updateUser,
  createUserWithProvider
} from '../app/controllers/userController';

export default async function handler(req, res) {
  switch (req.method) {
    case 'DELETE':
      return await deleteUser(req, res);

    case 'POST':
      if (req.body.red === "google" || req.body.red === "facebook") {
        return await createUserWithProvider(req, res);
      }
      return await createUser(req, res);

    case 'PUT':
      return await updateUser(req, res);

    default:
      res.setHeader('Allow', ['DELETE', 'POST', 'PUT']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
