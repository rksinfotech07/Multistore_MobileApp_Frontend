import API from "../api/axios";

// No token needed here — interceptor already adds it

export const getPendingShops = () =>
  API.get("/api/admin/pending");

export const approveShop = (id) =>
  API.put(`/api/admin/approve/${id}`);

export const declineShop = (id) =>
  API.put(`/api/admin/vendors/${id}/decline`);

export const getApprovedShops = () =>
  API.get("/api/admin/vendors/approved");

export const getDeclinedShops = () =>
  API.get("/api/admin/vendors/declined");

//  ADMIN SETTINGS APIs
export const getAdminProfile = () =>
  API.get("/api/admin/profile");

export const updateAdminProfile = (data) =>
  API.put("/api/admin/profile", data);
// 🔔 ADMIN NOTIFICATIONS (BELL)
export const getAdminNotifications = () =>
  API.get("/api/notifications/admin/notifications");

// ✅ ADD SUBCATEGORY
export const addSubCategory = (categoryId, formData) =>
  API.post(`/api/categories/${categoryId}/subcategories`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  // ✅ GET ALL CATEGORIES
export const getCategories = async () => {
  try {
    const res = await API.get("/api/common/categories"); // your endpoint
    return res.data; // ⚠️ directly array
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
// ✅ GET SUBCATEGORIES BY CATEGORY
export const getSubcategories = async (categoryId) => {
  try {
    const res = await API.get(
      `/api/common/categories/${categoryId}/subcategories`
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
// ✅ UPDATE SUBCATEGORY
export const updateSubCategory = async (id, formData) => {
  try {
    const res = await API.put(`/api/subcategories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};