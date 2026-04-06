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