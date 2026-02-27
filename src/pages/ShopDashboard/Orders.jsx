import { useEffect, useState } from "react";
import "../../styles/Shop/Orders.css";
import axios from "../../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH COMPLETED ORDERS
  ========================= */
 const fetchCompletedOrders = async () => {
  try {
    const res = await axios.get("/api/shop/orders");

    const allOrders = res.data.data || [];

    // ⭐ Get completed order IDs stored locally
    const completedIds = JSON.parse(
      localStorage.getItem("completedOrders") || "[]"
    );

    // ⭐ Filter orders
    const completedOrders = allOrders.filter(
      (order) =>
        order.status === "completed" ||   // backend completed
        completedIds.includes(order.id)   // frontend completed
    );

    setOrders(completedOrders);

  } catch (err) {
    console.error("Fetch completed orders failed", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  if (loading) return <p>Loading completed orders...</p>;

  return (
  <div className="completed-page">

    {/* ===== HEADER ===== */}
    <div className="completed-top">
      <div>
        <h2 className="completed-title">Completed Orders</h2>

        <p className="completed-sub">
          {orders.length} orders fulfilled today
        </p>
      </div>

      {/* (Optional search box UI only) */}
      <div className="completed-search">
        <input
          type="text"
          placeholder="Search completed orders..."
        />
      </div>
    </div>

    {/* ===== GRID ===== */}
    <div className="completed-grid">
      {orders.length === 0 ? (
        <p>No completed orders yet</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="completed-card">

            {/* TOP ROW */}
            <div className="completed-card-top">

              <div className="completed-id-badge">
                <p className="completed-id">#{order.id}</p>

                <span className="completed-badge">
                  Completed
                </span>
              </div>

              <div className="completed-price">
                ₹{order.total_amount}
              </div>

            </div>

            {/* CUSTOMER */}
            <p className="completed-customer">
              {order.customer_name || "Customer"}
            </p>

            {/* ITEMS */}
            <p className="completed-items">
  {Array.isArray(order.items) && order.items.length > 0
    ? order.items
        .map((i) => `${i.qty || 1}x ${i.name || "Item"}`)
        .join(", ")
    : "No items"}
</p>

            {/* TIME */}
            <p className="completed-time">
  {order.created_at
    ? new Date(order.created_at).toLocaleString()
    : "—"}
</p>

          </div>
        ))
      )}
    </div>

  </div>
);
}