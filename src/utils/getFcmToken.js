import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export const getFcmToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY"
    });

    console.log("FCM Token:", token);
    return token;

  } catch (error) {
    console.error("Error getting token:", error);
  }
};