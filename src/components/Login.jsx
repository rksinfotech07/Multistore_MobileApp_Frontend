import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { vendorLogin, adminLogin } from "../services/authService";
import { getVendorProfile } from "../services/ProfileService";
import { saveToken } from "../utils/authStorage";
import { getFcmToken } from "../utils/getFcmToken";

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [pendingMsg, setPendingMsg] = useState("");
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const validateLogin = () => {
  let newErrors = {};

  if (!loginData.email) {
    newErrors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.email)) {
    newErrors.email = "Invalid email format";
  }

  if (!loginData.password) {
    newErrors.password = "Password is required";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // ✅ SINGLE, CLEAN LOGIN FUNCTION
  const handleLogin = async () => {
  if (!validateLogin()) return;
  try {
    let res;

    // 🟢 ADMIN LOGIN
    if (loginData.email === "admin@gmail.com") {
      res = await adminLogin(loginData);

      const token = res.data.token;
      saveToken(token);
      login({ token, role: "admin" });
      navigate("/admin/dashboard");
      return;
    }

    // 🟡 VENDOR LOGIN
res = await vendorLogin(loginData);

console.log("LOGIN RESPONSE 👉", res.data);

const token = res.data.token;

console.log("TOKEN FROM RESPONSE 👉", token);

// ✅ Store token using helper
saveToken(token);

console.log("TOKEN IN STORAGE 👉", localStorage.getItem("vendor_token"));
// 🔔 GET FCM TOKEN
const fcmToken = await getFcmToken();

console.log("FCM TOKEN 👉", fcmToken);


      /* =========================
         SAVE FCM TOKEN TO BACKEND
      ========================= */

      if (fcmToken) {

        await fetch(`${API_URL}/api/notifications/save-fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            token: fcmToken
          })
        });

        console.log("✅ FCM token saved to backend");

      } else {

        console.warn("⚠️ FCM token not generated");

      }
      
// 🔥 NOW CALL PROFILE API
const shopData = await getVendorProfile();

// ✅ Store full profile including id
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

login({ token, role: "vendor" });
navigate("/shop-dashboard");
  } catch (err) {
  const status = err.response?.status;
  const message = err.response?.data?.message;

  // ⏳ Vendor pending approval
  if (status === 403) {
    setPendingMsg("⏳ Your shop is waiting for admin approval.");
    return;
  }

  setPendingMsg("");

  // 🌐 Network error
  if (!err.response) {
    alert("Network error. Please check your internet connection.");
    return;
  }

  // ❌ Wrong password
  if (status === 401) {
    setErrors({ password: "Incorrect password" });
    return;
  }

  // ❌ Email not found
  if (status === 404) {
    setErrors({ email: "Account not found" });
    return;
  }

  // 💥 Server issue
  if (status === 500) {
    alert("Server error. Please try again later.");
    return;
  }

  // fallback
  alert(message || "Login failed");
}

};

  return (
    <>
      <h1 className="login-title">Login</h1>
      <p className="subtitle">Welcome back! Sign in to your account</p>

      <div className="field">
        <label>Email Address *</label>
        <div className="input-pro">
          <span className="icon">📧</span>
          <input
            type="email"
            placeholder="user@gmail.com"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
          />
        </div>
        {errors.email && <p className="login-error">{errors.email}</p>}
      </div>

      <div className="field">
        <label>Password *</label>
        <div className="input-pro">
          <span className="icon">🔒</span>
          <input
            type="password"
            placeholder="••••••••"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
          />
          
          
        </div>
        {errors.password && <p className="login-error">{errors.password}</p>}
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
        onClick={() => navigate("/register")}
      >
        Become a Shop Owner
      </button>
    </>
  );
}