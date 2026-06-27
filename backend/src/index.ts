import './firebase';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import habitRoutes from './routes/habitRoutes';
import notificationRoutes from './routes/notificationRoutes';
import stripeRoutes from './routes/stripeRoutes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json()); // Permite recibir datos en formato JSON


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