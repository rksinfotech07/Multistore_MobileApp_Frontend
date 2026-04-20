importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC3hAIqhkKsTsmQ13Jva8p2SPQzQE9noZM",
  authDomain: "mabzo-fcm.firebaseapp.com",
  projectId: "mabzo-fcm",
  messagingSenderId: "568526845616",
  appId: "1:568526845616:web:a1d0025e33f40d50c2ed75"
});

const messaging = firebase.messaging();

/* 🔥 BACKGROUND NOTIFICATION */
messaging.onBackgroundMessage(function(payload) {

  console.log("🔥 Background message:", payload);

  const title = payload?.notification?.title || "New Notification";
  const body = payload?.notification?.body || "You have a new update";

  self.registration.showNotification(title, {
    body: body,
    icon: "/logo.png",   // ✅ IMPORTANT
    badge: "/logo.png",  // ✅ optional
    vibrate: [200, 100, 200],
    data: {
      url: "/"   // 👉 where to open on click
    }
  });
});

/* 🔥 CLICK ACTION */
self.addEventListener("notificationclick", function(event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});