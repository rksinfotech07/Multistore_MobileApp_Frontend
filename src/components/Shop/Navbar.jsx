import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardList, CalendarClock, Box, User } from "lucide-react";
import axios from "../../api/axios";
import ProfileModal from "./ProfileModal";
import UpdateProfileModal from "./updateProfileModal";
import "../../styles/Shop/Navbar.css";

export default function Navbar({ shopActive, setShopActive }) {
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [showOnlinePopup, setShowOnlinePopup] = useState(false);
    // 🔔 Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [shakeBell, setShakeBell] = useState(false);
  /* =========================
   FETCH NOTIFICATIONS
========================= */
const fetchNotifications = async () => {
  try {

    const res = await axios.get("/api/notifications");

    if (res.data?.success) {
      setNotifications(res.data.data);
    }

  } catch (err) {
    console.error("Notification fetch error 👉", err);
  }
};
useEffect(() => {
  fetchNotifications();
  
}, []);
useEffect(() => {
  const handleNewNotification = () => {
    console.log("🔔 Navbar received notification event");

    setTimeout(() => {
      fetchNotifications();
    }, 200);

    const audio = new Audio("/sounds/notificationSound.mp3");
    audio.play().catch(() => {});

    setShakeBell(true);
    setTimeout(() => setShakeBell(false), 600);
  };

  window.addEventListener("newNotification", handleNewNotification);

  return () => {
    window.removeEventListener("newNotification", handleNewNotification);
  };
}, []);

  /* 🔹 PROFILE DATA FROM LOCAL STORAGE */
  const [profileData, setProfileData] = useState(
    JSON.parse(localStorage.getItem("profileData")) || {}
  );

  /* 🔹 SYNC PROFILE UPDATES */
  useEffect(() => {
    const updateProfile = () => {
      const latest = JSON.parse(localStorage.getItem("profileData"));
      setProfileData(latest);
    };

    window.addEventListener("profileUpdated", updateProfile);
    return () =>
      window.removeEventListener("profileUpdated", updateProfile);
  }, []);

  /* 🔹 TAB STYLE */
const tabClass = ({ isActive }) =>  
    `nav-tab ${isActive ? "active" : ""}`;

  return (
    <>
      <header className="navbar">

        {/* ===== LEFT : SHOP BRAND ===== */}
        <div className="nav-left">
          <div
            className={`brand-logo ${
              shopActive ? "active" : "inactive"
            }`}
          >
            🍔
          </div>
 <span className="brand-name">
  Mabzo
</span>
          
        </div>

        {/* ===== CENTER : NAV TABS ===== */}
        <div className="nav-center">
          <NavLink to="/shop-dashboard" end className={tabClass}>
            <LayoutDashboard size={16} />
            Overview
          </NavLink>

          <NavLink to="/shop-dashboard/orders" className={tabClass}>
            <ClipboardList size={16} />
            Orders
          </NavLink>
          
          <NavLink to="/shop-dashboard/prebooking" className={tabClass}>
  <CalendarClock size={16} />
  Prebooking
</NavLink>

          <NavLink to="/shop-dashboard/products" className={tabClass}>
            <Box size={16} />
            Products
          </NavLink>
        </div>

        {/* ===== RIGHT : STATUS + PROFILE ===== */}
        <div className="nav-right">

  {/* 🔔 NOTIFICATION BELL */}
          <div className="notification-wrapper">
    <button
      className={`bell-btn ${shakeBell ? "bell-shake" : ""}`}
      onClick={() => setShowNotifications(!showNotifications)}
    >
      🔔

      {notifications.length > 0 && (
        <span className="bell-count">
          {notifications.length}
        </span>
      )}
    </button>

    {showNotifications && (
      <div className="notification-popup">
        <div className="notification-header">
    <h4>Notifications</h4>

    <button
      className="notif-close"
      onClick={() => setShowNotifications(false)}
    >
      ✕
    </button>
  </div>

        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="notification-item">
              <b>{n.title}</b>
              <p>{n.message}</p>
              <span>
                {new Date(n.created_at).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    )}

  </div>

          {/* 🔹 STATUS TOGGLE (OLD LOGIC) */}
          <div className="status-group">
          <div
            onClick={() => {
              setShopActive((prev) => {
  const next = !prev;

  localStorage.setItem("shopActive", JSON.stringify(next));
  window.dispatchEvent(
  new Event("shopStatusChanged")
);

                if (!next) {
                  setShowOfflinePopup(true);
                  setTimeout(() => setShowOfflinePopup(false), 3000);
                } else {
                  setShowOnlinePopup(true);
                  setTimeout(() => setShowOnlinePopup(false), 3000);
                }

                return next;
              });
            }}
            className={`status-toggle ${shopActive ? "on" : ""}`}
          >
            <div className="toggle-circle" />
          </div>

          <span
            className={`status-text ${
              shopActive ? "active" : ""
            }`}
          >
            {shopActive ? "Active" : "Inactive"}
          </span>
          </div>

          {/* 🔹 PROFILE BUTTON (MODAL WORKS) */}
          <div
            className={`profile-btn ${
              shopActive ? "active" : "inactive"
            }`}
            onClick={() => setOpenProfile(true)}
          >
            <User size={18} />
          </div>
        </div>
      </header>

      {/* ===== PROFILE MODAL ===== */}
      <ProfileModal
        open={openProfile}
        onClose={() => setOpenProfile(false)}
        onEdit={(data) => {
          setProfileData(data);
          setOpenProfile(false);
          setOpenEdit(true);
        }}
      />

      {/* ===== UPDATE PROFILE ===== */}
      <UpdateProfileModal
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        profile={profileData}
      />

      {/* ===== POPUPS ===== */}
      {showOfflinePopup && (
  <div className="toast modern warning">
    <div className="toast-icon-box">⚠</div>
    <div>
      <p className="toast-title">You are offline</p>
      <p className="toast-sub">
        New orders won’t be received
      </p>
    </div>
  </div>
)}

{showOnlinePopup && (
  <div className="toast modern success">
    <div className="toast-icon-box">✓</div>
    <div>
      <p className="toast-title">You are online</p>
      <p className="toast-sub">
        Ready to receive orders
      </p>
    </div>
  </div>
)}
    </>
  );
}