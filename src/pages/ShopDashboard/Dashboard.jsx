import { Inbox, RefreshCcw, DollarSign, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import OrderCard from "../../components/Shop/orderCard";
import axios from "../../api/axios";
import "../../styles/Shop/Dashboard.css";

/* ===== COUNTER ===== */
function Counter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 700;
    const increment = value / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count}</>;
}

export default function Dashboard() {
  /* ⭐ GET GLOBAL STATUS FROM LAYOUT */
  const { shopActive } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

    /* ===== PROFILE DATA ===== */
  const [profileData, setProfileData] = useState(
    JSON.parse(localStorage.getItem("profileData")) || {}
  );

  useEffect(() => {
    const updateProfile = () => {
      const latest = JSON.parse(localStorage.getItem("profileData"));
      setProfileData(latest);
    };

    window.addEventListener("profileUpdated", updateProfile);
    return () =>
      window.removeEventListener("profileUpdated", updateProfile);
  }, []);

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

  
  /* ===== OFFLINE MODE ===== */
if (!shopActive) {
  return (
    <div className="offline-screen">
      <div className="offline-card">

        <div className="offline-icon">⏻</div>

        <h2>You're Offline</h2>

        <p>
          Your store is currently not receiving any new orders.
          Switch your status to <b>Active</b> to start accepting orders instantly.
        </p>

        <div className="offline-hint">
          💡 Turn ON the toggle in the top-right corner to go online
        </div>

      </div>
    </div>
  );
}

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
      {/* ===== HEADER ===== */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">
            Welcome back, {profileData?.shop_name || profileData?.owner_name || "User"} 👋
          </h1>

          <p className="welcome-sub">
            Here's what's happening with your store today.
          </p>
        </div>

        <div className="search-box">
          <Search className="search-icon" size={18} />

          <input
  type="text"
  placeholder="Search orders..."
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
/>
        </div>
      </div>

      {/* ===== STATS ===== */}
      <div className="stats-row">

        <div className="stat-box">
          <div>
            <p className="stat-label">New Orders</p>
            <h2 className="stat-number">
              <Counter value={orders.length} />
            </h2>
          </div>

          <div className="stat-icon-box orange">
            <Inbox size={28} />
          </div>
        </div>

        <div className="stat-box">
          <div>
            <p className="stat-label">Orders in Process</p>
            <h2 className="stat-number">
              <Counter value={activeOrders.length} />
            </h2>
          </div>

          <div className="stat-icon-box coral">
            <RefreshCcw size={28} />
          </div>
        </div>

        <div className="stat-box">
          <div>
            <p className="stat-label">Today's Revenue</p>
            <h2 className="stat-number">
              ₹<Counter value={totalRevenue} />
            </h2>
          </div>

          <div className="stat-icon-box gold">
            <DollarSign size={28} />
          </div>
        </div>

      </div>

      {/* ===== LIVE HEADER ===== */}
      <div className="live-header">
        <h2 className="live-title">Live Orders</h2>

        <div className="live-status">
          <span className="live-dot"></span>
          Live
        </div>
      </div>

      {/* ===== ORDERS GRID ===== */}
      <div className="order-grid">
        {activeOrders.length === 0 ? (
          <p>
  {searchText
    ? "No matching orders found"
    : "No active orders"}
</p>
        ) : (
          activeOrders.map(order => (
            <OrderCard
              key={order.id}
              id={order.id}
              name={order.customer_name || "Unknown"}
              amount={order.total_amount || 0}
              statusFromDB={order.status}
              items={order.items}
            />
          ))
        )}
      </div>
    </>
  );
}