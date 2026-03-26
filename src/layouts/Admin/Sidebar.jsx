import { NavLink } from "react-router-dom";
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
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo"> Admin</div>

        <NavLink to="/admin/dashboard" className="side-link">
  <LayoutDashboard size={18} />
  Dashboard
</NavLink>

<NavLink to="/admin/shops" className="side-link">
  <Store size={18} />
  Shops
</NavLink>

<NavLink to="/admin/orders" className="side-link">
  <Package size={18} />
  Orders
</NavLink>

<NavLink to="/admin/add-product" className="side-link">
  <PlusCircle size={18} />
  Add Product
</NavLink>

<NavLink to="/admin/delivery-agents" className="side-link">
  <Truck size={18} />
  Delivery Agents
</NavLink>

<NavLink to="/admin/settings" className="side-link">
  <Settings size={18} />
  Settings
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
  Log Out
</button>
    </div>
  );
};

export default Sidebar;
