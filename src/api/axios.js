import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // 🔥 VERY IMPORTANT
});

/* RESPONSE INTERCEPTOR */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Refreshing token...");

        await instance.post("/api/auth/refresh");

        console.log("✅ Token refreshed");

        return instance(originalRequest);
      } catch (err) {
        console.log("❌ Refresh failed");

        window.location.href = "/"; // login page
      }
    }

    return Promise.reject(error);
  }
);
// 🔥 ADD THESE BACK (IMPORTANT)
export const acceptOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/accept`);

export const markReady = (id) =>
  instance.put(`/api/shop/orders/${id}/ready`);

export const declineOrder = (id) =>
  instance.put(`/api/shop/orders/${id}/decline`);

export default instance;