import { NavLink } from "react-router-dom";


const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-logo"> Admin</div>

        <NavLink to="/admin/dashboard" className="side-link">📊 Dashboard</NavLink>
        <NavLink to="/admin/shops" className="side-link">🏪 Shops</NavLink>
         <NavLink to="/admin/orders" className="side-link">📦 Orders</NavLink>
        <NavLink to="/admin/add-product" className="side-link">➕ Add Product</NavLink>
        <NavLink to="/admin/delivery-agents" className="side-link">🚚 Delivery Agents</NavLink>
        <NavLink to="/admin/settings" className="side-link">⚙ Settings</NavLink>
        
      </div>

      <button
        type="button"
        className="signout-btn"
        onClick={() => {
          console.log("SIGN OUT CLICKED");
          localStorage.clear();
          window.location.replace("/");
        }}
      >
        ↩ Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
