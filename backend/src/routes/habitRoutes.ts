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

// GET: Obtener el progreso de los últimos 7 días para un usuario
router.get('/user/:userId/weekly-progress', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    // Calculamos el rango: hace 6 días (inicio) hasta hoy (fin)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Obtenemos todos los HabitLogs de los hábitos del usuario en ese rango
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId: userId },
        date: {
          gte: sevenDaysAgo,
          lte: today,
        },
        completed: true,
      },
      select: {
        date: true,
      },
    });

    // Construimos un array de los 7 días con el conteo de hábitos completados
    const result = [];
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);

      // Contamos cuántos logs coinciden con este día
      const count = logs.filter(log => {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === day.getTime();
      }).length;

      result.push({
        day: dayNames[day.getDay()],
        score: count,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("Error al obtener progreso semanal:", error);
    res.status(500).json({ error: 'Error al obtener el progreso semanal' });
  }
});

// GET: Calcular la racha actual y la racha máxima histórica de un usuario
router.get('/user/:userId/streaks', async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;

    // 1. Obtenemos todos los hábitos del usuario
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true },
    });

    if (habits.length === 0) {
      res.json({ currentStreak: 0, longestStreak: 0 });
      return;
    }

    const habitIds = habits.map(h => h.id);
    const totalHabits = habits.length;

    // 2. Traemos todos los logs ordenados por fecha descendente
    const logs = await prisma.habitLog.findMany({
      where: {
        habitId: { in: habitIds },
        completed: true,
      },
      select: { date: true },
      orderBy: { date: 'desc' },
    });

    // 3. Agrupamos los logs por fecha y contamos cuántos hábitos se completaron ese día
    const completionByDate = new Map<string, number>();
    for (const log of logs) {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      completionByDate.set(dateKey, (completionByDate.get(dateKey) || 0) + 1);
    }

    // 4. Un día "exitoso" = completó AL MENOS 1 hábito ese día
    // (puedes cambiar esto a totalHabits para exigir el 100%)
    const successDates = Array.from(completionByDate.entries())
      .filter(([_, count]) => count >= 1)
      .map(([date]) => date)
      .sort((a, b) => b.localeCompare(a)); // Más reciente primero

    if (successDates.length === 0) {
      res.json({ currentStreak: 0, longestStreak: 0 });
      return;
    }

    // 5. Calcular racha ACTUAL (desde hoy hacia atrás, sin saltar días)
    let currentStreak = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // La racha solo cuenta si el usuario completó algo hoy o ayer
    const startsFromToday =
      successDates[0] === todayStr || successDates[0] === yesterdayStr;

    if (startsFromToday) {
      currentStreak = 1;
      for (let i = 1; i < successDates.length; i++) {
        const prev = new Date(successDates[i - 1]);
        const curr = new Date(successDates[i]);
        const diffDays = Math.round(
          (prev.getTime() - curr.getTime()) / 86400000
        );
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break; // Se rompió la racha
        }
      }
    }

    // 6. Calcular racha HISTÓRICA más larga
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < successDates.length; i++) {
      const prev = new Date(successDates[i - 1]);
      const curr = new Date(successDates[i]);
      const diffDays = Math.round(
        (prev.getTime() - curr.getTime()) / 86400000
      );
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
    console.error("Error calculando rachas:", error);
    res.status(500).json({ error: 'Error al calcular las rachas' });
  }
});

export default router;