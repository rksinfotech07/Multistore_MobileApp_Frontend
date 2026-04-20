import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export const getFcmToken = async () => {
  try {
    console.log("🚀 getFcmToken CALLED");   // ✅ ADD THIS LINE
    const token = await getToken(messaging, {
      vapidKey: "BGO9XsTz-bXbdK7lU-YXMIYiro7eGhrwf70-2xHTUimmueo74HLlRsrHEVDIG3FUNZHLPdtWw1Bl0G3Np21a8YM"
    });
    console.log("🔥 FCM TOKEN:", token);

    return token;

  } catch (error) {
    console.error("FCM TOKEN ERROR:", error);
  }
};////