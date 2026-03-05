import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { vendorRegister } from "../services/authService";
import { createPortal } from "react-dom";


export default function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [formData, setFormData] = useState({
    shopName: "",
    category: "",
    phone: "",
    fullName: "",
    email: "",
    password: "",
    address: "",
    opensAt: "10:00",
    closesAt: "22:00",
    latitude: "",
    longitude: "",
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

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) newErrors.password = "Password is required";
  }

  // Step 3 validations
if (step === 3) {
  if (!formData.address.trim()) newErrors.address = "Address is required";
  if (!formData.latitude) newErrors.latitude = "Latitude is required";
  if (!formData.longitude) newErrors.longitude = "Longitude is required";
}


  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

useEffect(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
      },
      (err) => {
        console.log("Location permission denied");
      }
    );
  }
}, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const payload = {
        shop_name: formData.shopName,
        owner_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        business_type: formData.category,
        address: formData.address,
        opening_time: formData.opensAt,
        closing_time: formData.closesAt,
        latitude:  parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      };
    const res = await vendorRegister(payload);

    console.log("API Success:", res.data);

    // ✅ Show success popup
    setShowPopup(true);

    // 🔄 Redirect to login after 2 sec
    setTimeout(() => {
      navigate("/");
    }, 2000);

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
                <span className="icon">🏬</span>
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
              <span className="icon">📞</span>
              <input
                type="text"
                placeholder="+91 12548-26544"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
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
              <span className="icon">👤</span>
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
            <label>EMAIL ADDRESS *</label>
            <div className="input-pro">
              <span className="icon">✉️</span>
              <input
                type="email"
                placeholder="sarah@urban-grocers.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              </div>
              {errors.email && <p className="reg-error">{errors.email}</p>}
            
          </div>

          <div className="field">
            <label>PASSWORD *</label>
            <div className="input-pro">
              <span className="icon">🔒</span>
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
              <span className="icon">📍</span>
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
    <label>LATITUDE *</label>
    <div className="input-pro">
      <span className="icon">📍</span>
      <input
        type="text"
        placeholder="e.g. 11.0168"
        value={formData.latitude}
        onChange={(e) =>
          setFormData({ ...formData, latitude: e.target.value })
        }
      />
    </div>
    {errors.latitude && <p className="reg-error">{errors.latitude}</p>}
  </div>

  <div className="field">
    <label>LONGITUDE *</label>
    <div className="input-pro">
      <span className="icon">📍</span>
      <input
        type="text"
        placeholder="e.g. 76.9558"
        value={formData.longitude}
        onChange={(e) =>
          setFormData({ ...formData, longitude: e.target.value })
        }
      />
    </div>
    {errors.longitude && <p className="reg-error">{errors.longitude}</p>}
  </div>
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

          <div className="btn-row">
            <button className="back-btn" onClick={prev}>← Back</button>
            <button className="create-btn" onClick={next}>Continue →</button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <div className="success-icon">✓</div>
          <h2>Everything looks great!</h2>
          <p className="confirm-sub"> Review your shop card preview before submitting for approval. </p>

          <div className="preview-card">
            <div className="preview-img">
              <span>🏪</span>
              <div className="status-tag">REVIEWING</div>
            </div>

            <div className="preview-body">
              <h3>{formData.shopName}</h3>
              <p className="category">{formData.category}</p>
              <div className="preview-meta">
                <span>📍 {formData.address}</span>
                <span>🕒 {formData.opensAt} – {formData.closesAt}</span>
              </div>
            </div>
          </div>
          {/* INFO BOX */} <div className="info-box"> ℹ Our team usually reviews new shop applications within <b> 24–48 hours.</b> You will receive an email notification as soon as your shop is ready to go live. </div>

          <div className="btn-row">
            <button className="back-btn" onClick={() => setStep(3)}>← Back</button>
            <button className="submit-btn" onClick={handleSubmit}>
              Finish & Submit Application ✈
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
    </div>
  );
}
