import './firebase';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import habitRoutes from './routes/habitRoutes';
import notificationRoutes from './routes/notificationRoutes';
import stripeRoutes from './routes/stripeRoutes';
import rateLimit from 'express-rate-limit';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: { error: 'Demasiadas solicitudes, intenta más tarde' }
});

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Tu frontend
  credentials: true,
}));
// ✅ Webhook raw DESPUÉS de CORS, ANTES de JSON
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use('/api/', limiter);

// ✅ JSON para todo lo demás
app.use(express.json());


// Rutas
app.use('/api/habits', habitRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stripe', stripeRoutes);

// Ruta de prueba (Healthcheck)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor Habitae funcionando correctamente 🚀' });
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});