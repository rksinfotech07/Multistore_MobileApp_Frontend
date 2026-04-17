import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorRegister } from "../services/authService";
import { createPortal } from "react-dom";
import api from "../api/axios";
import {
  Store,
  Phone,
  User,
  Lock,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);   // ⭐ ADD THIS
  const [otp, setOtp] = useState("");  
  const [categoryOpen, setCategoryOpen] = useState(false);
useEffect(() => {
  const otpFlow = localStorage.getItem("otpFlow");

  if (otpFlow === "true") {
    setShowOtpPopup(true);
    setStep(4);
  } else {
    setStep(1); // 🔥 RESET FORM
  }
}, []);
  const [formData, setFormData] = useState({
    shopName: "",
    category: "",
    phone: "",
    fullName: "",
    password: "",
    address: "",
    opensAt: "10:00",
    closesAt: "22:00",
    shopImage: null,
  });

   const [errors, setErrors] = useState({});

  const next = () => {
  if (validateStep()) {
    setStep(step + 1);
  }
};

  const prev = () => setStep(step - 1);

  const validateStep = () => {
  let newErrors = {};

  // Step 1 validations
  if (step === 1) {
    if (!formData.shopName.trim()) newErrors.shopName = "Shop name is required";
    if (!formData.category) newErrors.category = "Category is required";

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
  }

  // Step 2 validations
  if (step === 2) {
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.password) newErrors.password = "Password is required";
  }

  // Step 3 validations
if (step === 3) {
  if (!formData.address.trim()) 
    newErrors.address = "Address is required";

  // 🔥 ADD THIS
  if (!formData.shopImage) 
    newErrors.shopImage = "Shop image is required";
}


  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const getLatLngFromAddress = (address) => {
  return new Promise((resolve, reject) => {

    if (!window.google) {
      reject("Google Maps not loaded");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: address }, (results, status) => {

      console.log("GEOCODER STATUS:", status);
      console.log("GEOCODER RESULTS:", results);

      if (status === "OK") {

        const location = results[0].geometry.location;

        resolve({
          lat: location.lat(),
          lng: location.lng()
        });

      } else {

        reject("Unable to find location");

      }

    });

  });
};
const handleSubmit = async (e) => {
  if (e) e.preventDefault(); // safer

  try {
    // DEBUG
console.log("ADDRESS ENTERED BY USER:", formData.address);
    // 1️⃣ Convert address → coordinates
    const coords = await getLatLngFromAddress(formData.address);
    console.log("COORDINATES RECEIVED:", coords);

    if (!coords) {
      alert("Unable to locate this address");
      return;
    }

    // 2️⃣ Build payload
    const form = new FormData();

form.append("shop_name", formData.shopName);
form.append("owner_name", formData.fullName);
form.append("phone", formData.phone);
form.append("password", formData.password);
form.append("business_type", formData.category);
form.append("address", formData.address);
form.append("latitude", coords.lat);
form.append("longitude", coords.lng);
form.append("opening_time", formData.opensAt);
form.append("closing_time", formData.closesAt);

if (formData.shopImage) {
  form.append("image", formData.shopImage);
}

    // 3️⃣ Call register API
    const res = await api.post("/api/vendor/register", form, {
  headers: {
    "Content-Type": "multipart/form-data"
  }
});

    console.log("API Success:", res.data);
    localStorage.setItem("token", res.data.verify_token);
    // 4️⃣ Show OTP popup
    setTimeout(() => {
    localStorage.setItem("otpFlow", "true");
    setShowOtpPopup(true);
    }, 200);
   //setShowOtpPopup(true);
//setShowPopup(true); // ✅ show success instead
//setTimeout(() => {
  //navigate("/");
//}, 2000); // 2 seconds

  } catch (err) {
    console.error("API Error:", err.response?.data || err.message);

    alert(
      err.response?.data?.message ||
      "Registration failed. Please try again."
    );
  }
};
const categories = [
  { value: "Food", label: "🍔 Food" },
  { value: "Grocery", label: "🛒 Grocery" },
  { value: "Pharmacy", label: "💊 Pharmacy" },
  { value: "Electronics", label: "📱 Electronics" },
  { value: "Cosmetics", label: "💄 Cosmetics" },
  { value: "Home Appliances", label: "🏠 Home Appliances" },
  { value: "Liquor", label: "🍷 Liquor" },
];
const dropdownStyle = categoryOpen
  ? (() => {
      const box = document.getElementById("shop-category-box");
      if (!box) return {};
      const rect = box.getBoundingClientRect();
      return {
        position: "absolute",
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 9999,
      };
    })()
  : {};
  const verifyOtp = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      "/api/vendor/verify-phone",
      { otp: otp },
      {
        headers: {
          Authorization: `Bearer ${token}` // 🔥 ADD THIS
        }
      }
    );

    alert("Phone verified successfully");

    localStorage.removeItem("otpFlow");
    localStorage.removeItem("token"); // 🔥 ADD THIS (cleanup)

    setShowOtpPopup(false);
    navigate("/");

  } catch (err) {
    console.log(err);
    alert(err.response?.data?.message || "Invalid OTP");
  }
};

  return (
    <div className={`register-card ${categoryOpen ? "dropdown-open" : ""}`}>
      <div className="step-header">
        <div className={`step ${step >= 1 ? "active" : ""}`}>Shop Info</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>Account</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>Operations</div>
        <div className={`step ${step >= 4 ? "active" : ""}`}>Confirm</div>
      </div>

      {step === 1 && (
        <>
          <h3 className="step-title">Tell us about your shop</h3>
          <p className="step-sub">
            Provide essential details to showcase your shop to customers.
          </p>

          <div className="field-row">
            <div className="field">
              <label>SHOP NAME *</label>
              <div className="input-icon">
                <Store size={18} className="icon" />
                <input
                  type="text"
                  placeholder="e.g.Urban Grocers"
                  value={formData.shopName}
                  onChange={(e) =>
                    setFormData({ ...formData, shopName: e.target.value })
                  }
                />
                </div>
                {errors.shopName && <p className="reg-error">{errors.shopName}</p>}

              
            </div>

 <div className="field">
  <label>CATEGORY *</label>

  <div
    id="shop-category-box"
    onClick={() => setCategoryOpen(!categoryOpen)}
  >
    <span className={formData.category ? "value" : "placeholder"}>
      {formData.category || "Select category"}
    </span>
    <span className="arrow">▾</span>
  </div>

  {categoryOpen &&
  createPortal(
    <div id="shop-category-menu" style={dropdownStyle}className="bg-white rounded-xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
      {categories.map((item) => (
<div
  key={item.value}
  onClick={() => {
    setFormData({ ...formData, category: item.value });
    setCategoryOpen(false);
  }}
  className={`
    relative px-4 py-2 flex items-center gap-3 cursor-pointer text-sm
    transition-all duration-200 ease-out
    whitespace-nowrap
    ${
      formData.category === item.value
        ? "bg-orange-500 text-white font-semibold shadow-sm"
        : "text-gray-800 hover:bg-gray-100"
    }
    hover:pl-6
  `}
>
  {/* left indicator */}
  {formData.category === item.value && (
    <span className="absolute left-0 top-0 h-full w-1 bg-orange-600 rounded-r" />
  )}

  {item.label}
</div>


      ))}
    </div>,
    document.body
  )}


  {errors.category && <p className="reg-error">{errors.category}</p>}
</div>
          </div>

          <div className="field">
            <label>BUSINESS CONTACT *</label>
            <div className="input-icon">
              <Phone size={18} className="icon" />
              <input
  type="tel"
  placeholder="9876543210"
  value={formData.phone}
  onChange={(e) =>
    setFormData({
      ...formData,
      phone: e.target.value.replace(/\D/g, "")
    })
  }
/>
              </div>
              {errors.phone && <p className="reg-error">{errors.phone}</p>}

            
          </div>

          <button className="create-btn" onClick={next}>
            Continue to Account →
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
  Already have an account?{" "}
  <span
    onClick={() => navigate("/")}
    className="text-orange-500 font-semibold cursor-pointer hover:underline"
  >
    Log in
  </span>
</p>
        </>
      )}

      {step === 2 && (
        <>
          <h3 className="step-title">Security & Ownership</h3>

          <div className="field">
            <label>FULL NAME *</label>
            <div className="input-pro">
              <User size={18} className="icon" />
              <input
                type="text"
                placeholder="e.g.Sarah"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
              </div>
              {errors.fullName && <p className="reg-error">{errors.fullName}</p>}
            
          </div>

          <div className="field">
            <label>PASSWORD *</label>
            <div className="input-pro">
              <Lock size={18} className="icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
              </div>
              {errors.password && <p className="reg-error">{errors.password}</p>}
          </div>

          <div className="btn-row">
            <button className="back-btn" onClick={prev}>← Back</button>
            <button className="create-btn" onClick={next}>Continue to Operations→</button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h3 className="step-title">Location & Hours</h3>

          <div className="field">
            <label>PHYSICAL ADDRESS *</label>
            <div className="input-pro">
              <MapPin size={18} className="icon" />
              <input
                type="text"
                placeholder="123,Market Square,Downtown"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
              </div>
              {errors.address && <p className="reg-error">{errors.address}</p>}
          </div>

          <div className="field-row">
            <div className="field">
              <label>OPENS AT</label>
              <div className="input-pro">
                <input
                  type="time"
                  value={formData.opensAt}
                  onChange={(e) =>
                    setFormData({ ...formData, opensAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="field">
              <label>CLOSES AT</label>
              <div className="input-pro">
                <input
                  type="time"
                  value={formData.closesAt}
                  onChange={(e) =>
                    setFormData({ ...formData, closesAt: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="field">
  <label>SHOP IMAGE *</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFormData({ ...formData, shopImage: e.target.files[0] })
    }
  />
  {errors.shopImage && (
    <p className="reg-error">{errors.shopImage}</p>
  )}
</div>

          <div className="btn-row">
            <button className="back-btn" onClick={prev}>← Back</button>
            <button className="create-btn" onClick={next}>Continue →</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="success-icon">
  <CheckCircle size={22} />
</div>
          <h2 className="confirm-title">Everything looks great!</h2>
          <p className="confirm-sub"> Review your shop card preview before submitting for approval. </p>
          <div className="preview-card">
            <div className="preview-img">
  {formData.shopImage ? (
    <img
      src={URL.createObjectURL(formData.shopImage)}
      alt="Shop"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
    />
  ) : (
    <span>🏪</span>
  )}

  <div className="status-tag">REVIEWING</div>
</div>

            <div className="preview-body">
              <h3>{formData.shopName}</h3>
              <div className="preview-meta">

  {/* 🔹 ROW 1 */}
  <div className="meta-row">
    <span className="category">{formData.category}</span>

    <span className="meta-item">
      <Clock size={14} className="meta-icon" />
      {formData.opensAt} – {formData.closesAt}
    </span>
  </div>

  {/* 🔹 ROW 2 */}
  <div className="meta-address">
    <MapPin size={14} className="meta-icon" />
    {formData.address}
  </div>

</div>
            </div>
          </div>
          {/* INFO BOX */} 
          <div className="info-box">
            <AlertCircle size={16} />
             We review new shop applications within 24–48 hours. You’ll be notified once your shop is live. </div>

          <div className="btn-row">
            <button className="back-btn" onClick={() => setStep(3)}>← Back</button>
           <button type="button" className="submit-btn" onClick={handleSubmit}>
  Finish & Submit ✈
</button>
          </div>
        </>
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            ✅ Application Submitted Successfully!
          </div>
        </div>
      )}

     {showOtpPopup && (
  <div
    className="popup-overlay"
    onClick={(e) => e.stopPropagation()}   // 🔥 ADD THIS
  >
    <div
      className="popup-box"
      onClick={(e) => e.stopPropagation()} // 🔥 ADD THIS
    >
      <h3>Verify Phone Number</h3>
      <p>Enter the OTP sent to your phone</p>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => {
          e.stopPropagation();              // 🔥 ADD THIS
          setOtp(e.target.value);
        }}
        className="otp-input"
      />

      <button className="create-btn" onClick={verifyOtp}>
        Verify OTP
      </button>
    </div>
  </div>
)}

    </div>
  );
}