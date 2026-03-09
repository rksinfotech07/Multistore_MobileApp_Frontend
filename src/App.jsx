import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { socket } from "./socket"; // ✅ SOCKET IMPORT

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

const DashboardHome = () => <h2 style={{color:"white"}}>Dashboard Overview</h2>;
const OrdersPage = () => <h2 style={{color:"white"}}>Orders Page</h2>;
const SettingsPage = () => <h2 style={{color:"white"}}>Settings Page</h2>;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/" />;
};

export default function App() {

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

  return (
    <BrowserRouter>
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
            <ProtectedRoute>
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
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Admindb />} />
          <Route path="shops" element={<AdminDashboard />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="delivery-agents" element={<DeliveryAgents />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* 🔐 SHOP VIEW WITHOUT SIDEBAR */}
        <Route
          path="/shop/:id"
          element={
            <ProtectedRoute>
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