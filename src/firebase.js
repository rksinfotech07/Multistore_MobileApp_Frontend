import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC3hAIqhkKsTsmQ13Jva8p2SPQzQE9noZM",
  authDomain: "mabzo-fcm.firebaseapp.com",
  projectId: "mabzo-fcm",
  messagingSenderId: "568526845616",
  appId: "1:568526845616:web:a1d0025e33f40d50c2ed75"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app); 
