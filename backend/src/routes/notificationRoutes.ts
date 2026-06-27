// backend/src/routes/notificationRoutes.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { getMessaging } from 'firebase-admin/messaging';

const router = Router();
const prisma = new PrismaClient();

// POST: Guardar token FCM de un dispositivo
router.post('/save-token', async (req: Request, res: Response) => {
  const { userId, token } = req.body;
  if (!userId || !token) {
    res.status(400).json({ error: 'userId y token son requeridos' });
    return;
  }

  try {
    await prisma.pushToken.upsert({
      where: { token },
      update: { userId },
      create: { userId, token },
    });
    res.json({ message: 'Token guardado correctamente' });
  } catch (error) {
    console.error("Error guardando token:", error);
    res.status(500).json({ error: 'Error al guardar el token' });
  }
});

// POST: Enviar notificación a todos los dispositivos de un usuario
router.post('/send', async (req: Request, res: Response) => {
  const { userId, title, body } = req.body;

  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId },
      select: { token: true },
    });

    if (tokens.length === 0) {
      res.json({ message: 'No hay dispositivos registrados' });
      return;
    }

    const tokenList = tokens.map((t: { token: string }) => t.token);

    const message = {
      notification: { title, body },
      tokens: tokenList,
    };

    const response = await getMessaging().sendEachForMulticast(message);;
    console.log(`Notificaciones enviadas: ${response.successCount} éxitos`);

    res.json({
      sent: response.successCount,
      failed: response.failureCount,
    });
  } catch (error) {
    console.error("Error enviando notificación:", error);
    res.status(500).json({ error: 'Error al enviar la notificación' });
  }
});

export default router;