import React, { useState, useEffect } from "react";
import "../styles/AdminSettings.css";
import SkeletonDashboard from "../components/common/SkeletonDashboard";
import { getAdminProfile, updateAdminProfile } from "../services/adminService";
import { Lock, Save, User, Mail, Phone, Pencil } from "lucide-react";

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
        password: "",
        currentPassword: ""
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

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="admin-settings-page">

      <div className="settings-card">

        {/* 🔥 TOP PROFILE */}
        <div className="profile-center">

  <div className="profile-row">  {/* 🔥 ADD THIS */}

    <div className="profile-avatar-large">
      {form.name?.charAt(0).toUpperCase()}
    </div>

    <div className="profile-info">  {/* 🔥 ADD THIS */}
      <h2>{form.name}</h2>
      <p>{form.email}</p>
      <span className="role-badge">Super Admin</span>
    </div>

  </div>

</div>

        {/* 🔥 FORM */}
        <div className="form-group">

          <label>Full Name</label>
          <div className="input-with-icon">
  <User size={16} />
  <input
    type="text"
    placeholder="Full Name"
    value={form.name}
    onChange={(e) => setForm({ ...form, name: e.target.value })}
  />
</div>

          <label>Email Address</label>
          <div className="input-with-icon">
  <Mail size={16} />
  <input
    type="email"
    placeholder="Email Address"
    value={form.email}
    onChange={(e) => setForm({ ...form, email: e.target.value })}
  />
</div>

          <label>Phone Number</label>
          <div className="input-with-icon">
  <Phone size={16} />
  <input
    type="text"
    placeholder="Phone Number"
    value={form.phone}
    onChange={(e) => setForm({ ...form, phone: e.target.value })}
  />
</div>

        </div>

        {/* 🔥 CHANGE PASSWORD */}
        <div className="password-section">

          <div
  className="password-header"
  onClick={() => {
    setShowPassword(!showPassword);

    // 🔥 RESET PASSWORD FIELDS
    setForm(prev => ({
      ...prev,
      currentPassword: "",
      password: ""
    }));
  }}
>
            <div>
              <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
  <Pencil size={16} />
  Change Password
</h4>
              <p>Keep your account secure</p>
            </div>

            <span>{showPassword ? "▲" : "▼"}</span>
          </div>

          {showPassword && (
            <div className="password-fields">

              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Enter current password"
                 value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                />
              </div>

              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>

            </div>
          )}

        </div>

        {/* 🔥 BUTTON */}
        <button className="primary-btn" onClick={handleUpdate}>
  <Save size={18} />
  Update Profile
</button>

      </div>

    </div>
  );
};

export default AdminSettings;