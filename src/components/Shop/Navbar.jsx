import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardList, CalendarClock, Box, User } from "lucide-react";
import ProfileModal from "./ProfileModal";
import UpdateProfileModal from "./updateProfileModal";
import "../../styles/Shop/Navbar.css";

export default function Navbar({ shopActive, setShopActive }) {
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [showOnlinePopup, setShowOnlinePopup] = useState(false);

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