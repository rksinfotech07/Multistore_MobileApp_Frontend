import api from "../api/axios";

// 🔹 GET All Delivery Agents
export const getDeliveryAgents = async () => {
  const response = await api.get("/api/admin/deliveries");

  // RETURN ONLY ARRAY
  return response.data.data;
};

// 🔹 DELETE Delivery Agent
export const deleteDeliveryAgent = async (id) => {
  const response = await api.delete(`/api/admin/deliveries/${id}`);
  return response.data;
};

// 🔹 UPDATE Agent Profile (Edit)
export const updateDeliveryAgent = async (id, data) => {
  const response = await api.put(
    `/api/admin/deliveries/edit-profile-id/${id}`,
    data
  );
  return response.data;
};
// 🔥 NEW: APPROVE AGENT
export const approveAgent = async (id) => {
  const response = await api.put(
    `/api/admin/deliveries/approve/${id}`
  );
  return response.data;
};

// 🔥 NEW: BLOCK AGENT
export const blockAgent = async (id, blocked) => {
  const response = await api.put(
    `/api/admin/deliveries/block/${id}`,
    {
      blocked: blocked
    }
  );
  return response.data;
};
