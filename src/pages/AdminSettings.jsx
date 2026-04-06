import React, { useState, useEffect } from "react";
import "../styles/AdminSettings.css";
import SkeletonDashboard from "../components/common/SkeletonDashboard";
import { getAdminProfile, updateAdminProfile } from "../services/adminService";

const AdminSettings = () => {

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
  name: "",
  email: "",
  phone: "",
  password: "",
  currentPassword: ""
});
  const [showPassword, setShowPassword] = useState(false);

  // ✅ MOVE INSIDE COMPONENT
  useEffect(() => {
  loadProfile();
}, []);

const loadProfile = async () => {
  try {
    const res = await getAdminProfile();

    setForm({
      name: res.data.name,
      email: res.data.email,
      phone: res.data.phone,
      password: ""
    });

  } catch (err) {
    console.error(err);
  }

  setLoading(false);
};
const handleUpdate = async () => {
  try {
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone
    };
//  PASSWORD UPDATE LOGIC
if (showPassword) {
  if (!form.currentPassword || !form.password) {
    alert("❌ Please fill both password fields");
    return;
  }

  payload.currentPassword = form.currentPassword;
  payload.newPassword = form.password;
}
    await updateAdminProfile(payload);

    alert("✅ Profile Updated Successfully");
    // 🔥 clear password fields
    setForm(prev => ({
      ...prev,
      password: "",
      currentPassword: ""
    }));

    setShowPassword(false);

  } catch (err) {
    console.error(err);
    alert("❌ Update failed");
  }
};

  // ✅ CORRECT PLACE
  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="admin-settings-page">
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
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
/>
          <input
            className="input-style"
            placeholder="Admin Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input-style"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {/* 🔥 CHANGE PASSWORD TOGGLE */}
<button
  type="button"
  className="toggle-password-btn"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? "Hide Password ▲" : "Change Password ▼"}
</button>

{/* 🔥 SHOW ONLY WHEN CLICKED */}
    {showPassword && (
  <>
    <input
      type="password"
      className="input-style"
      placeholder="Current Password"
      value={form.currentPassword}
      onChange={(e) =>
        setForm({ ...form, currentPassword: e.target.value })
      }
    />

    <input
      type="password"
      className="input-style"
      placeholder="New Password"
      value={form.password}
      onChange={(e) =>
        setForm({ ...form, password: e.target.value })
      }
    />
  </>
)}

        </div>

        <button className="primary-btn mt-6" onClick={handleUpdate}>
          Update Profile
        </button>

      </div>

    </div>
  );
};

export default AdminSettings;