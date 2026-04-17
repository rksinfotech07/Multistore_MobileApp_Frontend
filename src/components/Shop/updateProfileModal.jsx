import { useEffect, useState } from "react";
import SuccessModal from "../common/SuccessModal";
import { updateVendorProfile, verifyPhoneOtp } from "../../services/ProfileService";
import "../../styles/Shop/updateprofile.css";

import {
User,
Store,
Phone,
MapPin,
Clock,
Save
} from "lucide-react";
export default function UpdateProfileModal({ open, onClose, profile }) {
  const [formData, setFormData] = useState({
    shop_name: "",
    owner_name: "",
    phone: "",
    address: "",
    opening_time: "",
    closing_time: "",
    email: "",
  });
const [showOtpModal, setShowOtpModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
const [otp, setOtp] = useState("");
  // Fill form when profile comes
  useEffect(() => {
    if (profile) {
      setFormData({
        shop_name: profile.shop_name || "",
        owner_name: profile.owner_name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        opening_time: profile.opening_time || "",
        closing_time: profile.closing_time || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  if (!open) return null;

  const formatTime = (time) => {
  if (!time) return "00:00:00";

  // If already HH:MM:SS → return as is
  if (time.split(":").length === 3) return time;

  // If HH:MM → convert
  return time + ":00";
};

  // ✅ Update handler (same logic + sync added)
 const handleUpdate = async () => {
  try {

    // ⭐ SEND ONLY SAFE FIELDS
    const payload = {
      shop_name: formData.shop_name,
      owner_name: formData.owner_name,
      address: formData.address,
      phone: formData.phone,
      // ⭐ Normalize time safely
      opening_time: formatTime(formData.opening_time),
      closing_time: formatTime(formData.closing_time),
    };

    console.log("FINAL Payload 👉", payload);

     const res = await updateVendorProfile(payload);
     if (res.message === "OTP sent to new phone number") {
      alert("OTP sent to your phone 📱");
      setShowOtpModal(true);
      return;
    }
     const oldProfile = JSON.parse(localStorage.getItem("profileData")) || {};
    const updatedProfile = { ...oldProfile, ...payload };
    localStorage.setItem("profileData", JSON.stringify(updatedProfile));

    window.dispatchEvent(new Event("profileUpdated"));

    setShowSuccess(true);

  } catch (err) {
    console.error("Update failed", err);
  }
};

const handleVerifyOtp = async () => {
  try {
    const data = await verifyPhoneOtp(otp);   // 🔥 SERVICE CALL

    if (data.message === "Phone verified successfully") {
      alert("Phone verified successfully ✅");

      setShowOtpModal(false);
      setShowSuccess(true);
    } else {
      alert("Invalid OTP ❌");
    }

  } catch (err) {
    console.error("OTP verify error:", err);
  }
};

  


  return (
    <>
      <div className="profile-overlay">
        <div className="update-card">

          {/* HEADER */}
         <div className="update-header">

  <div className="update-header-left">

    <div className="update-avatar">
      <User size={22}/>
    </div>

    <div>
      <h3>Update Profile</h3>
      <p>{formData.email}</p>
    </div>

  </div>

  <button className="close-btn" onClick={onClose}>✕</button>

</div>

          {/* BODY */}
          <div className="update-body">

            <div className="form-row">
              <div className="form-group">
                <label>
  <Store size={14}/> Shop Name
</label>
                <input
                  value={formData.shop_name}
                  onChange={(e) =>
                    setFormData({ ...formData, shop_name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>
  <User size={14}/> Owner Name
</label>
                <input
                  value={formData.owner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_name: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>
  <Phone size={14}/> Contact
</label>
              <input
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="form-group">
             <label>
  <MapPin size={14}/> Address
</label>
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <div className="form-group">
              <label>
  <Clock size={14}/> Opens At
</label>
                <input
                  type="time"
                  value={formData.opening_time}
                  onChange={(e) =>
                    setFormData({ ...formData, opening_time: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>
  <Clock size={14}/> Closes At
</label>
                <input
                  type="time"
                  value={formData.closing_time}
                  onChange={(e) =>
                    setFormData({ ...formData, closing_time: e.target.value })
                  }
                />
              </div>
            </div>

          </div>

          {/* FOOTER */}
          <div className="update-footer">
           
           <button className="save-btn" onClick={handleUpdate}>
  <Save size={16}/> update
</button> 
          </div>

        </div>
      </div>

      {/* SUCCESS MODAL */}
      <SuccessModal
        open={showSuccess}
        title="Profile Updated 🎉"
        message="Your profile details were updated successfully."
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
      {/* 🔥 OTP MODAL ADD HERE */}
{showOtpModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Enter OTP 🔐</h3>

      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={handleVerifyOtp}>Verify</button>
        <button onClick={() => setShowOtpModal(false)}>Cancel</button>
      </div>
    </div>
  </div>
)}  

</>
);
}