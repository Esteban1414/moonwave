import { updateDiscountStatus } from '../app/controllers/userController';

export default async function handler(req, res) {
  switch (req.method) {
    case 'PUT':
      return await updateDiscountStatus(req, res);

    default:
      res.setHeader('Allow', ['PUT']);
      return res.status(405).json({ error: `Método ${req.method} no permitido` });
  }
}
