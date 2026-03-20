import React from "react";
import "../styles/AdminSettings.css";

const AdminSettings = () => {
  return (
    <div className="admin-settings-page">

      <h1 className="text-3xl font-bold mb-10 fade-in">
        Admin Settings
      </h1>

      {/* 🔹 ADMIN PROFILE */}
      <div className="settings-card profile-enhanced">

        <div className="profile-top">
          <div className="profile-avatar-large">
            A
          </div>

          <div>
            <h2 className="settings-title">Admin Profile</h2>
            <p className="profile-subtitle">
              Manage your account details and security
            </p>
            <span className="role-badge">Super Admin</span>
          </div>
        </div>

        <div className="form-group mt-6">
          <input
            className="input-style"
            placeholder="Admin Name"
          />

          <input
            className="input-style"
            placeholder="Admin Email"
          />

          <input
            className="input-style"
            placeholder="Phone Number"
          />

          <input
            type="password"
            className="input-style"
            placeholder="Change Password"
          />
        </div>

        <button className="primary-btn mt-6">
          Update Profile
        </button>

      </div>

    </div>
  );
};

export default AdminSettings;