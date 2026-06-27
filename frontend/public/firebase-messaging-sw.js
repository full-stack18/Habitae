importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDuEf-4m73ibGzjI7VE6YXOMNGE6Pc8HOc",
  authDomain: "habitae-f851a.firebaseapp.com",
  projectId: "habitae-f851a",
  storageBucket: "habitae-f851a.firebasestorage.app",
  messagingSenderId: "723389376473",
  appId: "1:723389376473:web:dc0d4dfbda9f4a8c55bc8"
});

const messaging = firebase.messaging();

// Manejar notificaciones cuando la app está en SEGUNDO PLANO
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Notificación en background:', payload);

  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body: body,
    icon: icon || '/logo.png',
    badge: '/logo.png',
    data: payload.data,
    actions: [
      { action: 'open', title: '¡Abrir Habitae!' },
      { action: 'dismiss', title: 'Ahora no' }
    ]
  });
});

// Al hacer clic en la notificación, abrir la app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('http://localhost:3000')
    );
  }
});