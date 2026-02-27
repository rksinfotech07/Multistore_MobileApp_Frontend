import { useEffect, useState } from "react";

import OrderCard from "../../components/Shop/orderCard";
import axios from "../../api/axios";
import "../../styles/Shop/Dashboard.css";

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =========================
     FETCH ORDERS -shop
  ========================= */
 const fetchOrders = async () => {
  try {
    const res = await axios.get("/api/shop/orders");

    console.log("Dashboard Orders 👉", res.data);

    // ⭐ CORRECT — use res.data.data
    if (res.data?.success && Array.isArray(res.data.data)) {
      setOrders(res.data.data);
    } else {
      setOrders([]);
    }
  } catch (err) {
    console.error("Fetch orders error 👉", err);
    setError("Unable to load orders");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

 // ⭐ Get completed IDs from localStorage
const completedIds = JSON.parse(
  localStorage.getItem("completedOrders") || "[]"
);

const activeOrders = orders.filter(
  (o) =>
    o.status !== "completed" &&
    !completedIds.includes(o.id)
);
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  );

  return (
    <>
      {/* ================= STATS ================= */}
<div className="grid grid-cols-3 gap-6 mb-8">

  {/* ================= NEW ORDERS ================= */}
  <div className="group relative overflow-hidden
    bg-white/70 backdrop-blur-xl
    rounded-2xl p-6
    shadow-lg transition-all duration-300
    hover:-translate-y-2 hover:shadow-2xl">

    <div className="absolute inset-0 rounded-2xl opacity-0
      group-hover:opacity-100 transition duration-500
      bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl">
    </div>

    <div className="relative flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center
        text-xl text-white
        bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
        📩
      </div>
      <div>
        <p className="text-xs tracking-wider font-semibold text-gray-500">
          NEW ORDERS
        </p>
        <h3 className="text-2xl font-bold text-gray-800">
          {orders.length}
        </h3>
      </div>
    </div>
  </div>

  {/* ================= ORDERS IN PROCESS ================= */}
  <div className="group relative overflow-hidden
    bg-white/70 backdrop-blur-xl
    rounded-2xl p-6
    shadow-lg transition-all duration-300
    hover:-translate-y-2 hover:shadow-2xl">

    <div className="absolute inset-0 rounded-2xl opacity-0
      group-hover:opacity-100 transition duration-500
      bg-gradient-to-r from-orange-500/20 via-pink-500/20 to-red-500/20 blur-xl">
    </div>

    <div className="relative flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center
        text-xl text-white
        bg-gradient-to-br from-orange-500 to-pink-500 shadow-md">
        📌
      </div>
      <div>
        <p className="text-xs tracking-wider font-semibold text-gray-500">
          ORDERS IN PROCESS
        </p>
        <h3 className="text-2xl font-bold text-gray-800">
          {activeOrders.length}
        </h3>
      </div>
    </div>
  </div>

  {/* ================= TODAY REVENUE ================= */}
  <div className="group relative overflow-hidden
    bg-white/70 backdrop-blur-xl
    rounded-2xl p-6
    shadow-lg transition-all duration-300
    hover:-translate-y-2 hover:shadow-2xl">

    <div className="absolute inset-0 rounded-2xl opacity-0
      group-hover:opacity-100 transition duration-500
      bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-green-500/20 blur-xl">
    </div>

    <div className="relative flex items-center gap-5">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center
        text-xl text-white
        bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
        💰
      </div>
      <div>
        <p className="text-xs tracking-wider font-semibold text-gray-500">
          TODAY'S REVENUE
        </p>
        <h3 className="text-2xl font-bold text-gray-800">
          ₹{totalRevenue}
        </h3>
      </div>
    </div>
  </div>

</div>


      {/* ================= HEADER ================= */}
      <div className="pipeline-header">
        <div>
          <p className="pipeline-title">⚡ Order Stream</p>
          <p className="pipeline-sub">
            Managing {activeOrders.length} live requests
          </p>
        </div>
        <span className="priority-badge">PRIORITY ATTENTION</span>
      </div>

      {/* ================= ORDERS ================= */}
      <div className="order-grid">
        {activeOrders.length === 0 ? (
          <p>No active orders</p>
        ) : (
          activeOrders.map((order) => (
            <OrderCard
  key={order.id}
  id={order.id}
  name={order.customer_name || "Unknown"}
  amount={order.total_amount || 0}
  statusFromDB={order.status}
  items={order.items}

  onComplete={(orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "completed" }
          : o
      )
    );
  }}
/>
          ))
        )}
      </div>
    </>
  );
}