import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { vendorLogin, adminLogin } from "../services/authService";
import { getVendorProfile } from "../services/ProfileService";


const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [pendingMsg, setPendingMsg] = useState("");
  const [loginData, setLoginData] = useState({
  identifier: "",   // ✅ email or phone
  password: "",
});
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(""); 

  const validateLogin = () => {
  let newErrors = {};

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isPhone = (value) => /^[0-9]{10}$/.test(value);

  if (!loginData.identifier) {
    newErrors.identifier = "Email or Phone is required";
  } else if (!isEmail(loginData.identifier) && !isPhone(loginData.identifier)) {
    newErrors.identifier = "Enter valid Email or Phone Number";
  }

  if (!loginData.password) {
    newErrors.password = "Password is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
const handleLogin = async () => {
  setApiError("");
  if (!validateLogin()) return;

  try {
    let res;

    // ✅ MOVE THIS TO TOP (IMPORTANT FIX)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.identifier);
    const isPhone = /^[0-9]{10}$/.test(loginData.identifier);

    let payload = {
      password: loginData.password,
    };

    if (isEmail) {
      payload.email = loginData.identifier;
    } else if (isPhone) {
      payload.phone = loginData.identifier;
    } else {
      setErrors({ identifier: "Enter valid Email or Phone Number" });
      return;
    }

    // 🟢 ADMIN LOGIN
    if (loginData.identifier === "admin@gmail.com") {
      res = await adminLogin(payload);

      setErrors({}); 

      localStorage.setItem("role", "admin");
login({ role: "admin" });
      navigate("/admin/dashboard");
      return;
    }

    // 🟡 VENDOR LOGIN
    res = await vendorLogin(payload);

    setErrors({});
    
    const shopData = await getVendorProfile();

    localStorage.setItem(
      "profileData",
      JSON.stringify({
        id: shopData.id,
        shop_name: shopData.shop_name,
        owner_name: shopData.owner_name,
        email: shopData.email,
        phone: shopData.phone,
        address: shopData.address,
        opening_time: shopData.opening_time,
        closing_time: shopData.closing_time,
        business_type: shopData.business_type,
        shop_logo: shopData.shop_logo,
      })
    );

    localStorage.setItem("role", "vendor");
login({ role: "vendor" });
    navigate("/shop-dashboard");

  } catch (err) {
    const status = err.response?.status;
    const message = err.response?.data?.message;

    if (status === 403) {
      setPendingMsg("⏳ Your shop is waiting for admin approval.");
      return;
    }

    setPendingMsg("");

    if (!err.response) {
      alert("Network error. Please check your internet connection.");
      return;
    }

    if (status === 401) {
  setApiError("Incorrect password"); 
  return;
}

    if (status === 404) {
      setErrors({ identifier: "Account not found" }); // ✅ FIXED
      return;
    }

    if (status === 500) {
      alert("Server error. Please try again later.");
      return;
    }

    alert(message || "Login failed");
  }
};

  return (
    <>
      <h1 className="login-title">Login</h1>
      <p className="subtitle">Welcome back! Sign in to your account</p>

      <div className="field">
        <label>Email or Phone Number *</label>
        <div className="input-pro">
          <span className="icon">📧</span>
          <input
  type="text"
  placeholder="Enter email or phone number"
  value={loginData.identifier}
  onChange={(e) => {
  setLoginData({ ...loginData, identifier: e.target.value });
  setErrors((prev) => ({ ...prev, identifier: "" })); // 🔥 clear only this field
}}
/>
        </div>
        {errors.identifier && <p className="login-error">{errors.identifier}</p>}
      </div>

      <div className="field">
        <label>Password *</label>
        <div className="input-pro">
          <span className="icon">🔒</span>
          <input
            type="password"
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) => {
  setLoginData({ ...loginData, password: e.target.value });
  setErrors((prev) => ({ ...prev, password: "" }));
  setApiError(""); 
}}
          />
          
          
        </div>
        {apiError && <p className="login-error">{apiError}</p>}
        <p className="forgot-wrap">
  <span onClick={() => navigate("/forgot-password")} className="forgot-link">
    Forgot Password?
  </span>
</p>

        
      </div>

      <button className="create-btn login-btn" onClick={handleLogin}>
        Sign In to Dashboard →
      </button>

      {pendingMsg && (
        <div style={{ marginTop: "15px", color: "#b45309", fontWeight: "bold" }}>
          {pendingMsg}
        </div>
      )}

      <div className="or-text">OR</div>

      <button
        className="back-btn owner-btn"
        onClick={() => {
  localStorage.removeItem("otpFlow");  // 🔥 VERY IMPORTANT
  localStorage.removeItem("token");    // 🔥 VERY IMPORTANT
  navigate("/register");
}}
      >
        Become a Shop Owner
      </button>
    </>
  );
}