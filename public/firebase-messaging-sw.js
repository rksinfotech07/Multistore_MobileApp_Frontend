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

messaging.onBackgroundMessage(function(payload) {

  console.log("Background message received:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body
  });

});