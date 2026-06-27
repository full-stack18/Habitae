import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import serviceAccountJson from './firebase-admin-key.json';

// Le decimos a TypeScript que confíe en que este JSON cumple con la estructura de un ServiceAccount
const serviceAccount = serviceAccountJson as ServiceAccount;

// Inicializamos la app una sola vez aquí
initializeApp({
  credential: cert(serviceAccount),
});

// Exportamos getMessaging para que notificationRoutes.ts lo pueda usar
export { getMessaging } from 'firebase-admin/messaging';