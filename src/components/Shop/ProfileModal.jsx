import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getVendorProfile } from "../../services/ProfileService";
import "../../styles/Shop/Profile.css";
/* ICONS */
import {
User,
Store,
MapPin,
Phone,
Clock,
Calendar,
LogOut,
ShieldCheck,
Key
} from "lucide-react";
export default function ProfileModal({ open, onClose, onEdit }) {
  const navigate = useNavigate();          // ✅ FIX: hook at top
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  const fetchProfile = async () => {
    try {
      const vendor = await getVendorProfile();
      console.log("PROFILE FROM API 👉", vendor);
      setProfile(vendor);
    } catch (err) {
      console.error("Profile API error", err);
    }
  };

  // ✅ Secure Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("shopActive");
    onClose();
    navigate("/"); // change to /login if needed
  };

  if (!open) return null;

  return (
    <div className="profile-overlay">
      <div className="profile-card">

        {/* HEADER */}
        <div className="profile-header">
          <div className="profile-left">
            <div className="profile-avatar">
              <User size={26} />
               </div>
            <div>
              <h3>{profile?.owner_name}</h3>
              <p className="shop-name">{profile?.shop_name}</p>
              <p>{profile?.email}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="edit-btn"
              onClick={() => onEdit(profile)}
            >
               ✏️Edit Profile
            </button>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

    {/* BODY */}
<div className="profile-body">

  {/* DETAILS */}
  <div className="info-grid">

    <div className="info-item">
      <strong>
        <ShieldCheck size={16} /> Account Status
      </strong>
      <p className="status-approved">Approved</p>
    </div>

    <div className="info-item">
      <strong>
        <Key size={16} /> Access Role
      </strong>
      <p>Owner</p>
    </div>

    <div className="info-item">
      <strong>
        <User size={16} /> Owner
      </strong>
      <p>{profile?.owner_name}</p>
    </div>

    <div className="info-item">
      <strong>
        <Store size={16} /> Shop Name
      </strong>
      <p>{profile?.shop_name}</p>
    </div>

    <div className="info-item full">
      <strong>
        <MapPin size={16} /> Address
      </strong>
      <p>{profile?.address}</p>
    </div>

    <div className="info-item">
      <strong>
        <Clock size={16} /> Operational Hours
      </strong>
      <p>
        {profile?.opening_time || "-"} – {profile?.closing_time || "-"}
      </p>
    </div>

    <div className="info-item">
      <strong>
        <Phone size={16} /> Contact
      </strong>
      <p>{profile?.phone}</p>
    </div>

    <div className="info-item full">
      <strong>
        <Calendar size={16} /> Registered On
      </strong>
      <p>
        {profile?.created_at
          ? new Date(profile.created_at).toDateString()
          : "-"}
      </p>
    </div>

  </div>
</div>


        {/* LOGOUT */}
       <button className="signout-btn" onClick={handleLogout}>
  <LogOut size={18} />
  Logout
</button>

      </div>
    </div>
  );
}