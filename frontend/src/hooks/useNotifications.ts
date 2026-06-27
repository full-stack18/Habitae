// frontend/src/hooks/useNotifications.ts
"use client";

import { useState, useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useNotifications(postgresUserId: string | null) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  // Registra el service worker con las variables de entorno inyectadas
  const registerServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) return null;

    try {
      // Primero cargamos la configuración, luego el SW principal
      const swReg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js?v=2",
        { scope: "/" }
      );
      return swReg;
    } catch (error) {
      console.error("Error registrando Service Worker:", error);
      return null;
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        await initFCM();
      }
      return result;
    } catch (error) {
      console.error("Error solicitando permiso:", error);
      return "denied" as NotificationPermission;
    }
  };

  const initFCM = async () => {
    try {
      const swRegistration = await registerServiceWorker();
      if (!swRegistration) return;

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (token && postgresUserId) {
        setFcmToken(token);
        // Guardamos el token en nuestra base de datos
        await fetch("http://localhost:4000/api/notifications/save-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: postgresUserId, token }),
        });
        console.log("FCM Token guardado:", token);
      }
    } catch (error) {
      console.error("Error inicializando FCM:", error);
    }
  };

  // Manejar notificaciones cuando la app está en PRIMER PLANO
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;

    setPermission(Notification.permission);

    if (Notification.permission === "granted" && postgresUserId) {
      initFCM();

      try {
        const messaging = getMessaging(app);
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log("Notificación en foreground:", payload);
          // Mostramos una notificación toast manual en primer plano
          if (payload.notification) {
            new Notification(payload.notification.title || "Habitae", {
              body: payload.notification.body,
              icon: "/logo.png",
            });
          }
        });
        return unsubscribe;
      } catch (error) {
        console.error("Error en onMessage:", error);
      }
    }
  }, [postgresUserId]);

  return { permission, fcmToken, requestPermission };
}