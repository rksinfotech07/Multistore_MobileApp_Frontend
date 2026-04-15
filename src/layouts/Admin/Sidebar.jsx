import api from "../../api/axios";
import { NavLink } from "react-router-dom";
import { useState } from "react";   
import {
  LayoutDashboard,
  Store,
  Package,
  PlusCircle,
  Truck,
  Settings,
  LogOut
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
    <div className="sidebar-top">

  <div className="sidebar-header">
   
  <div className="sidebar-logo">
  {!collapsed && <span>Mabzo</span>}
</div>
  </div>

        <NavLink to="/admin/dashboard" className="side-link">
  <LayoutDashboard size={18} />
  {!collapsed && <span>Dashboard</span>}
</NavLink>

<NavLink to="/admin/shops" className="side-link">
  <Store size={18} />
  {!collapsed && <span>Shops</span>}
</NavLink>

<NavLink to="/admin/orders" className="side-link">
  <Package size={18} />
  {!collapsed && <span>Orders</span>}
</NavLink>

<NavLink to="/admin/add-product" className="side-link">
  <PlusCircle size={18} />
  {!collapsed && <span>Add Product</span>}
</NavLink>

<NavLink to="/admin/delivery-agents" className="side-link">
  <Truck size={18} />
  {!collapsed && <span>Delivery Agents</span>}
</NavLink>

<NavLink to="/admin/settings" className="side-link">
  <Settings size={18} />
  {!collapsed && <span>Settings</span>}
</NavLink>
      </div>
      
      <button
  className="collapse-btn"
  onClick={() => setCollapsed(!collapsed)}
>
  {!collapsed ? "← Collapse" : "→"}
</button>

      <button
  type="button"
  className="signout-btn"
  onClick={async () => {
  try {
    await api.post("/api/auth/logout"); // 🔥 clear cookies

    localStorage.clear();
    localStorage.removeItem("role"); // 🔥 IMPORTANT

    window.location.replace("/");
  } catch (err) {
    console.log("Logout error", err);
  }
}}
>
  <LogOut size={18} />
  {!collapsed && <span>Log Out</span>}
</button>
    </div>
  );
};

export default Sidebar;