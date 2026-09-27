/* Firebase Cloud Messaging Service Worker */
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyA5C8eSO7HXr4M9XNkuRmRUbvyqCpyOCNc",
  authDomain: "gen-lang-client-0414297445.firebaseapp.com",
  projectId: "gen-lang-client-0414297445",
  storageBucket: "gen-lang-client-0414297445.firebasestorage.app",
  messagingSenderId: "546920263763",
  appId: "1:546920263763:web:69cf6dc1c922e7316ad6a6"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification?.title || "Rich 'N' Royal Cafe";
  const notificationOptions = {
    body: payload.notification?.body || "You have an update on your cafe order.",
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: payload.data?.orderId || 'cafe-order',
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
