import { getFcmToken } from "./getFcmToken";

const API_URL = import.meta.env.VITE_API_URL;

export const setupFcm = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    const token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("vendor_token");

    if (!token) return;

    const fcmToken = await getFcmToken();

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

  } catch (err) {
    console.error("FCM error:", err);
  }
};