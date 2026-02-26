import { useState, useEffect } from "react";
import "../../styles/Shop/orderCard.css";
import {
  acceptOrder,
  markReady
} from "../../api/axios";

export default function OrderCard({
  id,
  name,
  amount,
  statusFromDB,
  items = []
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
    else if (s === "accepted") setStatus("preparing");
    else if (s === "preparing") setStatus("preparing");
    else if (s === "ready") setStatus("ready");
    else if (s === "completed") setStatus("completed");
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
  const handleComplete = async () => {
  setStatus("completed"); // ⭐ NO API CALL
};

 const handleDecline = async () => {
  try {
    setLoading(true);

    await completeOrder(id); // ⭐ Backend call for decline

    setStatus("completed"); // Update UI after success
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
