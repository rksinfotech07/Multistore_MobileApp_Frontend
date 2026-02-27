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
    <div className="orders-page">
      <h2 className="orders-title">📦 Completed Orders</h2>

      <div className="orders-grid">
        {orders.length === 0 ? (
          <p>No completed orders yet</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card completed">
              {/* HEADER */}
              <div className="order-header">
                <h4>{order.customer_name || "Customer"}</h4>
                <span className="amount">₹{order.total_amount}</span>
              </div>

              {/* ITEMS */}
              <ul className="items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, i) => (
                    <li key={i}>
                      {item.qty}× {item.name}
                    </li>
                  ))
                ) : (
                  <li>No items</li>
                )}
              </ul>

              {/* FOOTER */}
              <div className="order-footer">
                <span className="time">
                  {new Date(order.created_at).toLocaleTimeString()}
                </span>

                <div className="handled">
                  ORDER COMPLETED
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}