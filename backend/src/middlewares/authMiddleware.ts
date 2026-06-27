// backend/src/middlewares/authMiddleware.ts
import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    res.status(401).json({ error: 'Token requerido' });
    return;
  }
  try {
    const decoded = await getAuth().verifyIdToken(token);
    (req as any).uid = decoded.uid;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}