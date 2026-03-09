import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "../../api/axios";
import { socket } from "../../socket";
import OrderCard from "../../components/Shop/orderCard";
import shopClosedImg from "../../assets/shopClosed.png";
import "../../styles/Shop/Dashboard.css";

export default function Prebooking() {
  const { shopActive } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  if (!shopActive) {
    setLoading(false);
  }
}, [shopActive]);

  /* =========================
     FETCH PREBOOKING ORDERS
  ========================= */

  const fetchOrders = async () => {
    try {

      const res = await axios.get("/api/shop/orders");

      if (res.data?.success && Array.isArray(res.data.data)) {

        const scheduledOrders = res.data.data
          .filter((o) => o.order_type === "scheduled")
          .map((o) => ({
            ...o,
            id: o.id || o.order_id,
            orderCode: o.order_code,
            createdAt: o.created_at
          }));

        setOrders(scheduledOrders);

      } else {

        setOrders([]);

      }

    } catch (err) {

      console.error("Prebooking fetch error:", err);

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
     SOCKET LISTENER
  ========================= */

  useEffect(() => {

    socket.on("new_order", (data) => {

  const newOrder = Array.isArray(data) ? data[0] : data;

  if (newOrder.order_type === "scheduled") {

    const formattedOrder = {
      ...newOrder,
      id: newOrder.id || newOrder.order_id,
      orderCode: newOrder.order_code,
      createdAt: newOrder.created_at,
      total_amount: newOrder.total_amount,
      status: newOrder.status,
      items: newOrder.items || []
    };

    setOrders((prev) => [formattedOrder, ...prev]);

  }

});

    socket.on("order_update", (update) => {

      setOrders((prev) =>
        prev.map((o) =>
          o.id === update.order_id
            ? { ...o, status: update.status }
            : o
        )
      );

    });

    return () => {
      socket.off("new_order");
      socket.off("order_update");
    };

  }, []);

  /* =========================
     SEARCH FILTER
  ========================= */
  const completedIds = JSON.parse(
  localStorage.getItem("completedOrders") || "[]"
);

  const filteredOrders = orders.filter((o) => {

  const search = searchText.toLowerCase();

  return (
    o.order_type === "scheduled" &&
    !completedIds.includes(o.id) &&
    (
      (o.orderCode || "").toLowerCase().includes(search) ||
      String(o.id).includes(search)
    )
  );

});
  const completedScheduledOrders = orders.filter((o) => {

  return (
    o.order_type === "scheduled" &&
    completedIds.includes(o.id)
  );

});
if (!shopActive) {
  return (
    <div className="offline-screen">
      <div className="offline-card">

        <img
          src={shopClosedImg}
          alt="Shop Closed"
          className="offline-img"
        />

        <h2>You're Offline</h2>

        <p>
          Your store is not receiving orders now.
          Switch to <b>Active</b>
        </p>

      </div>
    </div>
  );
}

  if (loading) return <p>Loading prebooking orders...</p>;

  return (
    <>
      <div className="dashboard-header">

        <div>
          <h1 className="welcome-title">
            Prebooking Orders
          </h1>

          <p className="welcome-sub">
            View all scheduled orders for your store
          </p>
        </div>

        <div className="search-box">

          <Search className="search-icon" size={18} />

          <input
            type="text"
            placeholder="Search prebooking orders..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

        </div>

      </div>

      <div className="live-header">

        <h2 className="live-title">
          Scheduled Orders
        </h2>

        <div className="live-status">
          <span className="live-dot"></span>
          Scheduled
        </div>

      </div>

      <div className="order-grid">

        {filteredOrders.length === 0 ? (

          <p>No scheduled orders</p>

        ) : (

          filteredOrders.map((order) => (

            <OrderCard
  key={`pre-${order.id}-${order.status}`}
  id={order.id}
  orderCode={order.orderCode}
  createdAt={order.createdAt}
  amount={order.total_amount || 0}
  statusFromDB={order.status}
  orderType={order.order_type}
  items={order.items}
  onComplete={(orderId) => {

    const completed = JSON.parse(
      localStorage.getItem("completedOrders") || "[]"
    );

    if (!completed.includes(orderId)) {
      completed.push(orderId);

      localStorage.setItem(
        "completedOrders",
        JSON.stringify(completed)
      );
    }

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
      {/* COMPLETED SCHEDULED ORDERS */}

<div className="live-header" style={{ marginTop: "30px" }}>

  <h2 className="live-title">
    Completed Scheduled Orders
  </h2>

</div>

<div className="order-grid">

  {completedScheduledOrders.length === 0 ? (

    <p>No completed scheduled orders</p>

  ) : (

    completedScheduledOrders.map((order) => (

      <OrderCard
        key={`completed-${order.id}-${localStorage.getItem("completedOrders")}`}
        id={order.id}
        orderCode={order.orderCode}
        createdAt={order.createdAt}
        amount={order.total_amount || 0}
        statusFromDB={order.status}
        orderType={order.order_type}
        items={order.items}
      />

    ))

  )}

</div>
    </>
  );
}