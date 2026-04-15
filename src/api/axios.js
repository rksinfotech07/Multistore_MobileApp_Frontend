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

    // 🔄 If token expired
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        await instance.post("/auth/refresh");
        return instance(originalRequest);
      } catch (err) {
        window.location.href = "/"; // redirect to login
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