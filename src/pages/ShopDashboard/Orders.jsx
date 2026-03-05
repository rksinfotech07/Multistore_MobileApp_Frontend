import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import shopClosedImg from "../../assets/shopClosed.png";
import "../../styles/Shop/Orders.css";
import axios from "../../api/axios";
import { socket } from "../../socket";
import OrderCard from "../../components/Shop/orderCard";

export default function Orders() {

  const { shopActive } = useOutletContext();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const profileData =
    JSON.parse(localStorage.getItem("profileData")) || {};

  /* =========================
     STOP LOADING IF OFFLINE
  ========================= */

  useEffect(() => {
    if (!shopActive) setLoading(false);
  }, [shopActive]);

  /* =========================
     FETCH ORDERS
  ========================= */

  const fetchOrders = async () => {
    try {

      const res = await axios.get("/api/shop/orders");

      if (res.data?.success && Array.isArray(res.data.data)) {

        const mapped = res.data.data.map((o) => ({
          ...o,

          id: o.id || o.order_id,
          orderCode: o.order_code,
          createdAt: o.order_time || o.created_at || null,

          items:
  o.items?.map((item, index) => ({
    id: index,
    name: item.name,
    qty: item.qty,
    price: item.price || 0
  })) || []
        }));

        setOrders(mapped);

      } else {
        setOrders([]);
      }

    } catch (err) {
      console.error("Fetch orders failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopActive) fetchOrders();
  }, [shopActive]);

  /* =========================
     SOCKET LISTENER
  ========================= */

  useEffect(() => {

    if (!shopActive) return;

    const userId = profileData?.id;

    if (!userId) return;

    if (!socket.connected) socket.connect();

    const joinRoom = () => {
      socket.emit("joinVendorRoom", userId);
    };

    if (socket.connected) joinRoom();
    else socket.on("connect", joinRoom);

    /* NEW ORDER */

    socket.on("new_order", (newOrder) => {

      const formattedOrder = {
        id: newOrder.id || newOrder.order_id,
        orderCode: newOrder.order_code,
        createdAt:
          newOrder.created_at || newOrder.order_time || null,
        total_amount: newOrder.total_amount || 0,
        status: newOrder.status || "pending",

        items:
          newOrder.items?.map((item, index) => ({
            id: index,
            name: item.product_name || item.name,
qty: item.quantity || item.qty,
            price: item.price || 0
          })) || []
      };

      setOrders((prev) => [formattedOrder, ...prev]);
    });

    /* ORDER STATUS UPDATE */

    socket.on("order_update", (update) => {

      setOrders((prev) =>
        prev.map((o) =>
          o.id === update.order_id
            ? { ...o, status: update.status }
            : o
        )
      );

      /* when completed → reload from backend */
      if (update.status === "completed") {
        fetchOrders();
      }

    });

    return () => {
      socket.off("new_order");
      socket.off("order_update");
      socket.off("connect", joinRoom);
    };

  }, [shopActive, profileData?.id]);

  /* =========================
     OFFLINE SCREEN
  ========================= */

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

  if (loading) return <p>Loading orders...</p>;

  /* =========================
     FILTER ORDERS
  ========================= */
const completedIds = JSON.parse(
  localStorage.getItem("completedOrders") || "[]"
);

const liveOrders = orders.filter(
  (o) =>
    o.status !== "completed" &&
    !completedIds.includes(o.id)  &&
    (o.orderCode || "").toLowerCase().includes(searchText.toLowerCase())
);

const completedOrders = orders.filter(
  (o) =>
    (o.status === "completed" || completedIds.includes(o.id)) &&
    (
      (o.orderCode || "").toLowerCase().includes(searchText.toLowerCase()) ||
      String(o.id).includes(searchText)
    )
);

  /* =========================
     UI
  ========================= */

  return (
    <div className="completed-page">


      {/* LIVE ORDERS */}

     <div className="orders-header">

  <h2 className="orders-section-title">
    Live Orders
  </h2>

  <div className="completed-search">
   <input
  type="text"
  placeholder="Search orders..."
  value={searchText}
  onChange={(e) => setSearchText(e.target.value)}
/>
  </div>

</div>

      
      <div className="order-grid">

        {liveOrders.length === 0 ? (
          <p>No live orders</p>
        ) : (
          liveOrders.map((order) => (
            <OrderCard
              key={order.id}
              id={order.id}
              orderCode={order.orderCode}
              createdAt={order.createdAt}
              amount={order.total_amount}
              statusFromDB={order.status}
              items={order.items}
            />
          ))
        )}

      </div>

      {/* COMPLETED ORDERS */}

      <h2 className="orders-section-title">
        Completed Orders
      </h2>

      <div className="completed-grid">

        {completedOrders.length === 0 ? (
          <p>No completed orders yet</p>
        ) : (
          completedOrders.map((order) => (

            <div
              key={order.id}
              className="completed-card"
            >

              <div className="completed-card-top">

                <div className="completed-id-badge">

                  <p className="completed-id">
                    #{order.id}
                  </p>

                  <span className="completed-badge">
                    Completed
                  </span>

                </div>

                <div className="completed-price">
                  ₹{order.total_amount || 0}
                </div>

              </div>

              <p className="completed-customer">
                {order.customer_name || "Customer"}
              </p>

              <p className="completed-items">
                {Array.isArray(order.items) &&
                order.items.length > 0
                  ? order.items
                      .map(
                        (i) =>
                          `${i.qty || 1}x ${
                            i.name || "Item"
                          }`
                      )
                      .join(", ")
                  : "No items"}
              </p>

              <p className="completed-time">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : "—"}
              </p>

            </div>

          ))
        )}

      </div>

    </div>
  );
}