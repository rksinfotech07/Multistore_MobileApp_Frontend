import API from "../api/axios";

export const getDashboardData = async () => {
  try {
    const res = await API.get("/api/admin/dashboard");
    return res.data.data; // 🔥 IMPORTANT
  } catch (err) {
    console.error("Dashboard API Error 👉", err);
    return null;
  }
};