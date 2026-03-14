import { getFcmToken } from "./getFcmToken";

const API_URL = import.meta.env.VITE_API_URL;

export const setupFcm = async () => {

  try {

    const token = localStorage.getItem("vendor_token");

    if (!token) return;

    const fcmToken = await getFcmToken();

    if (!fcmToken) {
      console.warn("FCM token not generated");
      return;
    }

    await fetch(`${API_URL}/api/notifications/save-fcm-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        token: fcmToken
      })
    });

    console.log("FCM token saved");

  } catch (err) {
    console.error("FCM error:", err);
  }

};