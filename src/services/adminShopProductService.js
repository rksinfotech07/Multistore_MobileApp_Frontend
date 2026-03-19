import api from "../api/axios";

// 🔹 GET Products of a particular shop
export const getShopProducts = async (shopId) => {
  try {
    const response = await api.get(`/api/admin/shops/${shopId}/products`);
    return response.data; // returns ARRAY directly
  } catch (error) {
    console.error("Error fetching shop products 👉", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 ADD Product to a particular shop (Admin)
export const addShopProduct = async (shopId, formData) => {
  try {
    const response = await api.post(
      `/api/products/admin/${shopId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;

  } catch (error) {
  console.log("🔥 FULL BACKEND ERROR 👉", error.response?.data);
  console.log("🔥 STATUS 👉", error.response?.status);
  throw error;
}
};

// 🔹 UPDATE Product (Admin)
export const updateShopProduct = async (productId, payload) => {
  try {
    const response = await api.put(
      `/api/products/admin/${productId}`,
      payload,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating product 👉", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 DELETE Product (Admin)
export const deleteShopProduct = async (productId) => {
  try {
    const response = await api.delete(
      `/api/products/admin/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting product 👉", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 TOGGLE PRODUCT LIVE STATUS (Admin)
export const toggleProductLive = async (productId) => {
  try {
    const response = await api.patch(
      `/api/admin/products/${productId}/toggle`
    );
    return response.data;
  } catch (error) {
    console.error("Error toggling product 👉", error.response?.data || error.message);
    throw error;
  }
};

// 🔹 GET Single Shop Details (Admin)
export const getSingleShop = async (shopId) => {
  try {
    const response = await api.get(`/api/admin/shops/${shopId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching shop details 👉", error.response?.data || error.message);
    throw error;
  }
};
// 🔹 GET Single Product (Admin)
export const getSingleProduct = async (productId) => {
  try {
    const response = await api.get(`/api/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching single product 👉", error.response?.data || error.message);
    throw error;
  }
};


