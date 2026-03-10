import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";

export const getFcmToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: "BGO9XsTz-bXbdK7lU-YXMIYiro7eGhrwf70-2xHTUimmueo74HLlRsrHEVDIG3FUNZHLPdtWw1Bl0G3Np21a8YM"
    });

    console.log("FCM Token:", token);
    return token;

  } catch (error) {
    console.error("Error getting token:", error);
  }
};