import axios from "axios";
import { getToken } from "../utils/authStorage";

/* ================= AXIOS INSTANCE ================= */

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/* ================= REQUEST INTERCEPTOR ================= */

instance.interceptors.request.use(
  (config) => {
      
    const token =
  localStorage.getItem("admin_token") ||
  localStorage.getItem("vendor_token");

    /* PUBLIC ROUTES (NO TOKEN REQUIRED) */
    const publicRoutes = [
      "/api/vendor/register",
      "/api/vendor/verify-phone",
      "/api/auth/login"
    ];

    const isPublicRoute = publicRoutes.some((route) =>
      config.url?.includes(route)
    );

    /* ATTACH TOKEN ONLY FOR PROTECTED ROUTES */
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR (OPTIONAL) ================= */

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional global error handling
    if (error.response?.status === 401) {
      console.warn("Unauthorized request. Token may be invalid.");
    }

    return Promise.reject(error);
  }
);

/* ================= SHOP ORDER APIs ================= */

export const acceptOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/accept`);

export const markReady = (id) =>
  instance.put(`/api/shop/orders/${id}/ready`);

export const declineOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/decline`);

/* ================= EXPORT INSTANCE ================= */

export default instance;