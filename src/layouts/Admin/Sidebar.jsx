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
    <button 
      className="toggle-btn"
      onClick={() => setCollapsed(!collapsed)}
    >
      ☰
    </button>

    <div className="sidebar-logo">
      <span>Mabzo</span>
    </div>
  </div>

        <NavLink to="/admin/dashboard" className="side-link">
  <LayoutDashboard size={18} />
  <span>Dashboard</span>
</NavLink>

<NavLink to="/admin/shops" className="side-link">
  <Store size={18} />
  <span>Shops</span>
</NavLink>

<NavLink to="/admin/orders" className="side-link">
  <Package size={18} />
  <span>Orders</span>
</NavLink>

<NavLink to="/admin/add-product" className="side-link">
  <PlusCircle size={18} />
  <span>Add Product</span>
</NavLink>

<NavLink to="/admin/delivery-agents" className="side-link">
  <Truck size={18} />
  <span>Delivery Agents</span>
</NavLink>

<NavLink to="/admin/settings" className="side-link">
  <Settings size={18} />
  <span>Settings</span>
</NavLink>
      </div>

      <button
  type="button"
  className="signout-btn"
  onClick={() => {
    localStorage.clear();
    window.location.replace("/");
  }}
>
  <LogOut size={18} />
  <span>Log Out</span>
</button>
    </div>
  );
};

export default Sidebar;
