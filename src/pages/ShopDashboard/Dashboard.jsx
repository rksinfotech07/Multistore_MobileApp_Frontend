import { Inbox, RefreshCcw, DollarSign, Search, Zap, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import OrderCard from "../../components/Shop/orderCard";
import axios from "../../api/axios";
import { socket } from "../../socket"; // ✅ SOCKET IMPORT
import "../../styles/Shop/Dashboard.css";
import shopClosedImg from "../../assets/shopClosed.png";
import { onMessage } from "firebase/messaging";
import { messaging } from "../../firebase";

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

  /* 🔔 NOTIFICATION PERMISSION */
  useEffect(() => {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        console.log("✅ Notification permission granted.");
      } else {
        console.log("❌ Notification permission denied.");
      }
    });
  }, []);
/* 🔥 FCM MESSAGE LISTENER */
useEffect(() => {

  if (!messaging) return;

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log("🔥 FCM MESSAGE RECEIVED:", payload);

    const title = payload?.notification?.title || "New Order";
    const body = payload?.notification?.body || "You have a new order";

    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body: body,
        icon: "/logo.png"
      });

      notification.onclick = () => {
        window.focus();
      };
    }

    // 🔄 Refresh orders automatically
    fetchOrders();

  });

  return () => unsubscribe();

}, []);

  const { shopActive } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  const [profileData, setProfileData] = useState(
    JSON.parse(localStorage.getItem("profileData")) || {}
  );

  /* ===== PROFILE UPDATE LISTENER ===== */
  useEffect(() => {
    const updateProfile = () => {
      const latest = JSON.parse(localStorage.getItem("profileData"));
      setProfileData(latest);
    };

    window.addEventListener("profileUpdated", updateProfile);
    return () =>
      window.removeEventListener("profileUpdated", updateProfile);
  }, []);

  /* ===== STOP LOADING WHEN SHOP OFFLINE ===== */
useEffect(() => {
  if (!shopActive) {
    setLoading(false);
  }
}, [shopActive]);

  /* =========================
     FETCH ORDERS 
  ========================= */
  const fetchOrders = async () => {
    try {
      const res = await axios.get("/api/shop/orders");

     if (res.data?.success && Array.isArray(res.data.data)) {
      const mapped = res.data.data.map((o) => ({
  ...o,                    // ⭐ keep API data exactly as-is

  id: o.id || o.order_id,          // needed internally
  orderCode: o.order_code, // for display
  createdAt: o.order_time || o.createdAt || null, // for timer
  scheduledTime: o.scheduled_time || null 
}));

  setOrders(mapped);

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
  if (shopActive) {
    fetchOrders();
  }
}, [shopActive]);

/* =========================
   🔥 SOCKET LISTENER — FINAL
========================= */
useEffect(() => {
  if (!shopActive) return;
  const userId = profileData?.id;

  if (!userId) {
    console.log("❌ No userId found");
    return;
  }

  const roomName = `vendor_${userId}`;

  // 🔌 Ensure socket is connected
  if (!socket.connected) {
    console.log("🔌 Connecting socket...");
    socket.connect();
  }

  // 🏪 Join room AFTER connection
  const joinRoom = () => {
    socket.emit("joinVendorRoom", userId);
    console.log("🏪 Joined room:", roomName);
  };

  if (socket.connected) {
    joinRoom();
  } else {
    socket.on("connect", joinRoom);
  }

  /* 🔥 DEBUG — SEE ALL EVENTS FROM BACKEND */
  socket.onAny((event, ...args) => {
    console.log("📡 SOCKET EVENT:", event, args);
  });

  /* 🎯 Listen for new orders */
socket.on("new_order", (data) => {

  const newOrder = Array.isArray(data) ? data[0] : data;

  console.log("🔥 NEW ORDER RECEIVED:", newOrder);

  const formattedOrder = {
    id: newOrder.id || newOrder.order_id,
    orderCode: newOrder.order_code,
    createdAt: newOrder.created_at || newOrder.order_time || null,
    scheduledTime: newOrder.scheduled_time || null,
    total_amount: newOrder.total_amount || 0,
    status: newOrder.status || "pending",
    order_type: newOrder.order_type,

    items:
      newOrder.items?.map((item, index) => ({
        id: index,
        name: item.product_name || item.name,
        qty: item.quantity || item.qty,
        price: item.price || 0
      })) || [],
  };

  setOrders((prev) => [formattedOrder, ...prev]);

});
/* 🎯 STATUS UPDATE FROM BACKEND */
socket.on("order_update", (update) => {
  console.log("📦 ORDER UPDATE:", update);

  setOrders((prev) =>
    prev.map((o) =>
      o.id === update.order_id
        ? { ...o, status: update.status }   // ⭐ KEEP RAW STATUS
        : o
    )
  );
});
  return () => {
    socket.off("new_order");
    socket.off("order_update");
    socket.off("connect", joinRoom);
    socket.offAny(); // ✅ remove debug listener
  };
}, [shopActive, profileData?.id]);

  /* =========================
     UI STATES
  ========================= */
  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  if (!shopActive) {
  return (
    <div className="offline-screen">
      <div className="offline-card">

        {/* 🔥 IMAGE ADD HERE */}
        <img
          src={shopClosedImg}
          alt="Shop Closed"
          className="offline-img"
        />
        <h2>You're Offline</h2>
        <p>
          Your store is not receiving orders  now.
          Switch to <b>Active</b> 
        </p>

      </div>
    </div>
  );
}

  const completedIds = JSON.parse(
    localStorage.getItem("completedOrders") || "[]"
  );

const activeOrders = orders.filter((o) => {
  const search = searchText.toLowerCase();

  return (
    o.order_type === "instant" &&   // ⭐ IMPORTANT
    o.status !== "completed" &&
    !completedIds.includes(o.id) &&
    (
      (o.orderCode || "").toLowerCase().includes(search) ||
      String(o.id).includes(search)
    )
  );
});
/* =========================
   PREBOOKING ORDERS
========================= */


const prebookingOrders = orders.filter((o) => {
  const search = searchText.toLowerCase();

  return (
    o.order_type === "scheduled" &&
    o.status !== "completed" &&
    !completedIds.includes(o.id) &&   // ⭐ important
    (
      (o.orderCode || "").toLowerCase().includes(search) ||
      String(o.id).includes(search)
    )
  );
});
  const totalRevenue = orders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0
  );

  return (
    <>
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="welcome-title">
            Welcome back,{" "}
            {profileData?.shop_name ||
              profileData?.owner_name ||
              "User"}{" "}
            👋
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
            onChange={(e) =>
              setSearchText(e.target.value)
            }
          />
        </div>
      </div>

      {/* STATS */}
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

      {/* LIVE HEADER */}
      <div className="live-header">
        <h2 className="live-title">
  <Zap size={20} />
  Live Orders
</h2>
        <div className="live-status">
          <span className="live-dot"></span>
          Live
        </div>
      </div>

      {/* ORDERS GRID */}
      <div className="order-grid">
        {activeOrders.length === 0 ? (
          <p>
            {searchText
              ? "No matching orders found"
              : "No active orders"}
          </p>
        ) : (
          activeOrders.map((order) => (
            <OrderCard
  key={`${order.id}-${order.status}`}
  id={order.id}
  orderCode={order.orderCode}
  createdAt={order.createdAt}
  scheduledTime={order.scheduledTime} 
  amount={order.total_amount || 0}
  statusFromDB={order.status}
  items={order.items}
  orderType={order.order_type}
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
      {/* =========================
   PREBOOKING HEADER
========================= */}
<div className="live-header" style={{ marginTop: "30px" }}>
  <h2 className="live-title">
  <CalendarClock size={20} />
  Prebooking Orders
</h2>
<div className="live-status">
          <span className="live-dot"></span>
          Scheduled
        </div>
</div>

{/* PREBOOKING GRID */}
<div className="order-grid">

  {prebookingOrders.length === 0 ? (
    <p>No scheduled orders</p>
  ) : (
    prebookingOrders.map((order) => (
      <OrderCard
  key={`pre-${order.id}-${order.status}`}
  id={order.id}
  orderCode={order.orderCode}
  createdAt={order.createdAt}
  scheduledTime={order.scheduledTime} 
  amount={order.total_amount || 0}
  statusFromDB={order.status}
  items={order.items}
  orderType={order.order_type}
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