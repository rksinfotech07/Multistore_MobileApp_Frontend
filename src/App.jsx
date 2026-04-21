import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { socket } from "./socket";
import { setupFcm } from "./utils/saveFcmToken"; // your path
import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminDashboard from "./pages/AdminDashboard";
import "./App.css";
import ShopLayout from "./pages/ShopDashboard/ShopLayout";
import Dashboard from "./pages/ShopDashboard/Dashboard";
import Orders from "./pages/ShopDashboard/Orders";
import Products from "./pages/ShopDashboard/Products";
import AdminLayout from "./layouts/Admin/AdminLayout";
import FullPageLayout from "./layouts/Admin/FullPageLayout";
import ForgotPass from "./components/ForgotPass";
import AddProduct from "./components/admin/AddProduct";
import AdminShopProducts from "./components/admin/AdminShopProducts";
import AdminSettings from "./pages/AdminSettings";
import Admindb from "./pages/Admindb";
import DeliveryAgents from "./pages/DeliveryAgents";
import Prebooking from "./pages/ShopDashboard/Prebooking";
import AdminOrders from "./pages/AdminOrders";
import AddSubcategory from "./pages/AddSubcategory";

const DashboardHome = () => <h2 style={{color:"white"}}>Dashboard Overview</h2>;
const OrdersPage = () => <h2 style={{color:"white"}}>Orders Page</h2>;
const SettingsPage = () => <h2 style={{color:"white"}}>Settings Page</h2>;

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated } = useContext(AuthContext);

  const userRole = localStorage.getItem("role"); // 🔥 get role

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  // 🔥 ROLE CHECK
  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default function App() {

  /* =========================
   🔔 FCM SETUP
========================= */
useEffect(() => {
  setupFcm();
}, []);

  /* =========================
     🌐 GLOBAL SOCKET CONNECT
  ========================= */
  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      console.log("🌐 Global Socket Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
  /* =========================
   🔔 FCM LISTENER
========================= */
useEffect(() => {
  onMessage(messaging, (payload) => {
  console.log("🔔 FCM Message received: ", payload);

  const title = payload?.notification?.title || "New Notification";
  const body = payload?.notification?.body || "You have a new update";

  // ✅ METHOD 1: SYSTEM NOTIFICATION
  if (Notification.permission === "granted") {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        reg.showNotification(title, {
          body: body,
          icon: "/logo.png",
        });
      }
    });
  }

  // ✅ METHOD 2: DIRECT BROWSER NOTIFICATION (IMPORTANT)
  new Notification(title, {
    body: body,
    icon: "/logo.png",
  });

});
}, []);

  return (
    <BrowserRouter>
        <Toaster position="top-center" reverseOrder={false} />
      <Routes>

        {/* Login page */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPass />} />

        {/* Register page */}
        <Route path="/register" element={<RegisterPage />} />

        {/* 🔐 Shop Dashboard */}
        <Route
          path="/shop-dashboard"
          element={
            <ProtectedRoute role="vendor">
  <ShopLayout />
</ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="prebooking" element={<Prebooking />} />
          <Route path="products" element={<Products />} />
        </Route>

        {/* 🔐 ADMIN ROUTES WITH SIDEBAR */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
  <AdminLayout />
</ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Admindb />} />
          <Route path="shops" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="add-subcategory" element={<AddSubcategory />} />
          <Route path="delivery-agents" element={<DeliveryAgents />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 🔐 SHOP VIEW WITHOUT SIDEBAR */}
        <Route
          path="/shop/:id"
          element={
            <ProtectedRoute role="admin">
              <FullPageLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminShopProducts />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}