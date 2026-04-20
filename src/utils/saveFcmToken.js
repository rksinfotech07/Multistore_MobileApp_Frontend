import { getFcmToken } from "./getFcmToken";

const API_URL = import.meta.env.VITE_API_URL;

export const setupFcm = async () => {
  try {
    const permission = await Notification.requestPermission();
     console.log("🔔  Permission:", permission); 

    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

     console.log("🚀 Calling getFcmToken...");   // ✅ ADD THIS LINE

    const fcmToken = await getFcmToken();
    console.log("🔥 FCM TOKEN:", fcmToken); // ✅ debug


    if (!fcmToken) {
      console.warn("FCM token not generated");
      return;
    }

    await fetch(`${API_URL}/api/notifications/save-fcm-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: fcmToken
      })
    });
    console.log("✅ FCM token sent to backend");

  } catch (err) {
    console.error("FCM error:", err);
  }
};