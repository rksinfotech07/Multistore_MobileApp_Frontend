import { useState, useEffect } from "react";
import "../../styles/Shop/orderCard.css";
import {
  acceptOrder,
  markReady,
  declineOrder
} from "../../api/axios";

export default function OrderCard({
  id,
  orderCode,
  createdAt,
  amount,
  statusFromDB,
  items = [],
  onComplete
}) {
  const [status, setStatus] = useState(() => {
  if (!statusFromDB) return "received";

  const s = statusFromDB.toLowerCase();

  if (s === "pending") return "received";
  if (s === "accepted") return "accepted";
  if (s === "assigned") return "preparing";
  if (s === "ready") return "ready";
  if (s === "completed") return "completed";

  return "received";
});
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

  /* 🔥 FORCE UI UPDATE WHEN AGENT ASSIGNED */
useEffect(() => {
  if (status === "preparing") {
    // removes blur instantly
    document.body.offsetHeight;
  }
}, [status]);

/* =========================
   REAL ORDER TIME
========================= */

const getMinutesAgo = () => {
  if (!createdAt) return "Just now";

  // ⭐ Fix non-ISO date format
  const safeDate = new Date(
    createdAt.replace(" ", "T")
  );

  if (isNaN(safeDate)) return "Just now";

  const diffMs = Date.now() - safeDate.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin <= 0) return "Just now";
  if (diffMin === 1) return "1 min ago";

  return `${diffMin} min ago`;
};

  /* =========================
     API CALLS
  ========================= */

  const handleAccept = async () => {
    try {
      setLoading(true);
      await acceptOrder(id);
      setStatus("accepted");
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
    if (loading) return <span>Updating...</span>;

    // 🔹 NEW ORDER → Accept + Decline side by side
    if (status === "received") {
      return (
        <div className="action-buttons">
          <button className="accept-btn" onClick={handleAccept}>
            Accept
          </button>

          <button className="decline-btn" onClick={handleDecline}>
            Decline
          </button>
        </div>
      );
    }
    if (status === "accepted") {
  return (
    <div className="preparing-disabled">
      <button className="mark-ready-btn disabled-btn" disabled>
        Mark Ready
      </button>

      <span className="waiting-text">
        Waiting for delivery partner...
      </span>
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
    <div className={`order-row-card ${status}`}>

      {/* LEFT SIDE */}
      <div className="order-left">

        <div className="order-top">
          <strong>{orderCode}</strong>
</div>

        {/* ITEMS INLINE */}
        <div className="order-items">
          {items.length === 0
            ? "No items"
            : items.map(i => `${i.qty}x ${i.name}`).join(", ")
          }
        </div>

        {/* META INFO */}
        <div className="order-meta">
          <span className="price">₹{amount}</span>
          <span className="time">⏱ {getMinutesAgo()}</span>
        </div>

      </div>

      {/* RIGHT SIDE */}
<div className="order-right">

  {renderButton()}

  {/* ⭐ STATUS BELOW BUTTONS */}
  {status !== "accepted" && status !== "completed" && (
    <span className={`status-badge ${status}`}>
      {statusText[status]}
    </span>
  )}

</div>

    </div>
  );
}