import { io } from "socket.io-client";

/* =========================
   🔥 SOCKET URL
========================= */

/*
  Local Development → http://localhost:5000
  Production → use VITE_SOCKET_URL from .env
*/

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

console.log("🌐 SOCKET CONNECTING TO:", SOCKET_URL);

/* =========================
   🔌 CREATE SOCKET INSTANCE
========================= */

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],   // force websocket
  autoConnect: false,          // connect manually
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/* =========================
   🔥 GLOBAL DEBUG
========================= */

socket.on("connect", () => {
  console.log("🌐 Global Socket Connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("❌ Global Socket Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("🚨 Socket Connection Error:", err.message);
});