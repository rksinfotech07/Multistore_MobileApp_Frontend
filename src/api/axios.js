import axios from "axios";
import { getToken } from "../utils/authStorage";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

instance.interceptors.request.use((config) => {
  const token = getToken();
   console.log("TOKEN SENT 👉", token); // ⭐ DEBUG
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const acceptOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/accept`);

export const markReady = (id) =>
  instance.put(`/api/shop/orders/${id}/ready`);

export const declineOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/decline`);

export default instance;
