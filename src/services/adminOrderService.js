import API from "../api/axios";

// GET ALL ORDERS
export const getAllOrders = async () => {
  try {
    const res = await API.get("/api/admin/orders");
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// UPDATE NOTE
export const updateOrderNote = async (orderId, note) => {
  try {
  await API.patch(`/api/admin/orders/${orderId}/notes`, {
      notes: note,
    });
  } catch (err) {
    console.error(err);
  }
};