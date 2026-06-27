import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Obtener todos los hábitos de un usuario
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    
    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los hábitos' });
  }
});

// POST: Crear un nuevo hábito (con límite freemium)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { userId, title, description, frequency, color } = req.body;

    if (!userId || !title) {
      res.status(400).json({ error: 'userId y title son requeridos' });
      return;
    }

    // Verificar límite freemium
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true },
    });

    const habitCount = await prisma.habit.count({
      where: { userId },
    });

    if (!user?.isPremium && habitCount >= 5) {
      res.status(403).json({
        error: 'Límite de 5 hábitos alcanzado. ¡Actualiza a Premium!',
      });
      return;
    }

    const newHabit = await prisma.habit.create({
      data: { userId, title, description, frequency, color },
    });
    res.json(newHabit);
  } catch (error) {
    console.error('Error creando hábito:', error);
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
    await prisma.habit.delete({ where: { id } });
    res.json({ message: 'Hábito eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el hábito' });
  }
});

// POST: Alternar (Check/Uncheck) un hábito para el día de hoy
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const habitId = req.params.id as string;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.habitLog.findUnique({
      where: { habitId_date: { habitId, date: today } },
    });

    if (existingLog) {
      await prisma.habitLog.delete({ where: { id: existingLog.id } });
      res.json({ message: 'Hábito desmarcado', isCompleted: false });
    } else {
      await prisma.habitLog.create({
        data: { habitId, date: today, completed: true },
      });
      res.json({ message: 'Hábito completado', isCompleted: true });
    }
  } catch (error) {
    console.error('Error en toggle:', error);
    res.status(500).json({ error: 'Error al actualizar el hábito' });
  }
});

// POST: Sincronizar usuario de Firebase con PostgreSQL
router.post('/users/sync', async (req: Request, res: Response) => {
  const { email, firebaseUid } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { email },
      create: { email, firebaseUid },
    });
    res.json(user);
  } catch (error) {
    console.error('Error al sincronizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor al sincronizar usuario' });
  }
});

// GET: Progreso de los últimos 7 días
router.get('/user/:userId/weekly-progress', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: sevenDaysAgo, lte: today },
        completed: true,
      },
      select: { date: true },
    });

    const result = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const count = logs.filter((log) => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === day.getTime();
      }).length;

      result.push({ day: dayNames[day.getDay()], score: count });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener progreso semanal:', error);
    res.status(500).json({ error: 'Error al obtener el progreso semanal' });
  }
});

// GET: Calcular rachas
router.get('/user/:userId/streaks', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true },
    });

    if (habits.length === 0) {
      res.json({ currentStreak: 0, longestStreak: 0 });
      return;
    }

    const habitIds = habits.map((h) => h.id);

    const logs = await prisma.habitLog.findMany({
      where: { habitId: { in: habitIds }, completed: true },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    const completionByDate = new Map<string, number>();
    for (const log of logs) {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      completionByDate.set(dateKey, (completionByDate.get(dateKey) || 0) + 1);
    }

    const successDates = Array.from(completionByDate.entries())
      .filter(([_, count]) => count >= 1)
      .map(([date]) => date)
      .sort((a, b) => b.localeCompare(a));

    if (successDates.length === 0) {
      res.json({ currentStreak: 0, longestStreak: 0 });
      return;
    }

    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const startsFromToday =
      successDates[0] === todayStr || successDates[0] === yesterdayStr;

    if (startsFromToday) {
      currentStreak = 1;
      for (let i = 1; i < successDates.length; i++) {
        const prev = new Date(successDates[i - 1]);
        const curr = new Date(successDates[i]);
        const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < successDates.length; i++) {
      const prev = new Date(successDates[i - 1]);
      const curr = new Date(successDates[i]);
      const diffDays = Math.round((prev.getTime() - curr.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    res.json({ currentStreak, longestStreak });
  } catch (error) {
    console.error('Error calculando rachas:', error);
    res.status(500).json({ error: 'Error al calcular las rachas' });
  }
});

// GET: Estado premium del usuario
router.get('/user/:userId/status', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        subscription: {
          select: { status: true, currentPeriodEnd: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estado del usuario' });
  }
});

export default router;