import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Obtener todos los hábitos de un usuario
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string; // <-- Aquí solucionamos el error de TS
    
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los hábitos' });
  }
});

// POST: Crear un nuevo hábito
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, description, frequency, color } = req.body;

    if (!userId || !title) {
      res.status(400).json({ error: 'userId y title son requeridos' });
      return; 
    }

    const newHabit = await prisma.habit.create({
      data: { userId, title, description, frequency, color },
    });
    res.json(newHabit);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el hábito' });
  }
});

// PUT: Actualizar un hábito existente
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { title, description, frequency, color } = req.body;

    const updatedHabit = await prisma.habit.update({
      where: { id },
      data: { title, description, frequency, color },
    });
    res.json(updatedHabit);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el hábito' });
  }
});

// DELETE: Eliminar un hábito
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    await prisma.habit.delete({
      where: { id },
    });
    res.json({ message: 'Hábito eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el hábito' });
  }
});

// POST: Alternar (Check/Uncheck) un hábito para el día de hoy
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const habitId = req.params.id as string;

    // 1. Obtenemos solo la fecha de hoy (sin hora)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 2. Buscamos si ya existe un registro de este hábito HOY
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId: habitId,
          date: today,
        },
      },
    });

    // 3. Lógica del interruptor
    if (existingLog) {
      // Si ya existe, lo eliminamos (Desmarcar)
      await prisma.habitLog.delete({
        where: { id: existingLog.id },
      });
      res.json({ message: 'Hábito desmarcado', isCompleted: false });
    } else {
      // Si no existe, creamos el registro (Marcar como completado)
      await prisma.habitLog.create({
        data: { 
          habitId: habitId,
          date: today,
          completed: true 
        },
      });
      res.json({ message: 'Hábito completado', isCompleted: true });
    }
  } catch (error) {
    console.error("Error en toggle:", error);
    res.status(500).json({ error: 'Error al actualizar el hábito' });
  }
});

// POST: Sincronizar usuario de Firebase con PostgreSQL
router.post('/users/sync', async (req: Request, res: Response) => {
  const { email, firebaseUid } = req.body;

  try {
    // Upsert: Busca por firebaseUid. Si lo encuentra, lo actualiza; si no, lo crea.
    const user = await prisma.user.upsert({
      where: { firebaseUid: firebaseUid },
      update: { email: email }, // Si ya existe, nos aseguramos de que el correo esté al día
      create: {
        email: email,
        firebaseUid: firebaseUid,
      },
    });

    res.json(user); // Devolvemos el usuario completo de Postgres (con su id real)
  } catch (error) {
    console.error("Error al sincronizar usuario:", error);
    res.status(500).json({ error: 'Error en el servidor al sincronizar usuario' });
  }
});

export default router;