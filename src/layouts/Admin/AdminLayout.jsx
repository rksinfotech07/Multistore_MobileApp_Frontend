import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../styles/AdminLayout.css";
import { getAdminNotifications } from "../../services/adminService";

const AdminLayout = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // 🔥 LOAD NOTIFICATIONS INITIALLY
  useEffect(() => {
    const loadNotifications = async () => {
      const res = await getAdminNotifications();
      setNotifications(res.data.data || []);
    };

    loadNotifications();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />

      {/* 🔔 GLOBAL FIXED BELL */}
      <div className="global-bell">
        <div
          className="bell-icon"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          🔔
          {notifications.length > 0 && (
            <span className="badge">{notifications.length}</span>
          )}
        </div>

        {showDropdown && (
          <div className="notification-dropdown">
            {/* 🔴 ADD THIS HEADER */}
    <div className="notification-header">
      <span>Notifications</span>
      <span
        className="close-btn"
        onClick={() => setShowDropdown(false)}
      >
        ✖
      </span>
    </div>
     <div className="notification-list">
            {notifications.length === 0 ? (
              <p>No notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="notification-item">
                  <h5>{n.title}</h5>
                  <p>{n.message}</p>
                </div>
              ))
            )}
          </div>
          </div>
        )}
      </div>

      <div className="admin-content">
        {/* 👇 PASS FUNCTION TO CHILD */}
        <Outlet context={{ setNotifications }} />
      </div>
    </div>
  );
};

export default AdminLayout;