import { useState, useEffect } from "react";
import "../../styles/Shop/orderCard.css";
import {
  acceptOrder,
  markReady,
  declineOrder
} from "../../api/axios";

export default function OrderCard({
  id,
  name,
  amount,
  statusFromDB,
  items = [],
  onComplete
}) {
  const [status, setStatus] = useState("received");
  const [loading, setLoading] = useState(false);

  /* =========================
     NORMALIZE STATUS FROM DB
  ========================= */
  useEffect(() => {
    if (!statusFromDB) {
      setStatus("received");
      return;
    }

    const s = statusFromDB.toLowerCase();

    if (s === "pending") setStatus("received");

else if (s === "accepted")
  setStatus("accepted");   // waiting for agent

else if (s === "assigned")
  setStatus("preparing");  // agent assigned → shop can cook

else if (s === "ready")
  setStatus("ready");

else if (s === "completed")
  setStatus("completed");

else setStatus("received");
  }, [statusFromDB]);

  /* =========================
     API CALLS
  ========================= */

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptOrder(id);
      setStatus("preparing");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReady = async () => {
    try {
      setLoading(true);
      await markReady(id);
      setStatus("ready");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
 const handleComplete = () => {
  setStatus("completed");

  // ⭐ Get stored completed orders
  const completed = JSON.parse(
    localStorage.getItem("completedOrders") || "[]"
  );

  // ⭐ Add this order ID if not already present
  if (!completed.includes(id)) {
    completed.push(id);
    localStorage.setItem(
      "completedOrders",
      JSON.stringify(completed)
    );
  }

  // ⭐ Inform parent (Dashboard)
  if (onComplete) onComplete(id);
};

const handleDecline = async () => {
  try {
    setLoading(true);
    await declineOrder(id);

    setStatus("completed");
    if (onComplete) onComplete(id);

  } catch (err) {
    console.log(err);
  } finally {
    setLoading(false);
  }
};
  /* =========================
     BUTTON UI
  ========================= */
  const renderButton = () => {
    if (loading) return <div className="status-text">Updating...</div>;

    // 🔹 NEW ORDER → Accept + Decline side by side
    if (status === "received") {
      return (
        <div className="action-buttons">
          <button className="accept-btn" onClick={handleAccept}>
            Accept Order
          </button>

          <button className="decline-btn" onClick={handleDecline}>
            Decline
          </button>
        </div>
      );
    }
    if (status === "accepted") {
  return (
    <div className="status-text">
      Waiting for delivery partner...
    </div>
  );
}

    if (status === "preparing") {
      return (
        <button className="mark-ready-btn" onClick={handleReady}>
          Mark Ready
        </button>
      );
    }

    if (status === "ready") {
      return (
        <button className="dispatch-btn" onClick={handleComplete}>
          Complete
        </button>
      );
    }

    return <div className="order-complete">Order Completed</div>;
  };

  const statusText = {
    received: "NEW ORDER",
    preparing: "PREPARING",
    ready: "READY FOR PICKUP",
    completed: "COMPLETED"
  };

  return (
    <div className={`order-card ${status}`}>
      {/* HEADER */}
      <div className="order-header">
        <div>
          <h4>{name || "Customer"}</h4>
          <span className="order-id">Order #{id}</span>
        </div>

        <div className="header-right">
          <span className="amount">₹{amount}</span>
        </div>
      </div>

      {/* ITEMS */}
      <div className="order-body">
        <div className="items">
          {items.length === 0 ? (
            <div className="item-pill">No items</div>
          ) : (
            items.map((item, i) => (
              <div key={i} className="item-pill">
                {item.qty} × {item.name}
              </div>
            ))
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="order-footer">
        {renderButton()}
        <div className="status-text">{statusText[status]}</div>
      </div>
    </div>
  );
}
