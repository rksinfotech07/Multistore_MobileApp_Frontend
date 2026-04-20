import React, { useEffect, useState } from "react";
import { getPendingShops, approveShop, getApprovedShops, declineShop } from "../services/adminService";
import { getDeclinedShops } from "../services/adminService";
import "../styles/Admin.css";
import SkeletonDashboard from "../components/common/SkeletonDashboard";
import "../styles/common/common.css";
import { getAdminNotifications } from "../services/adminService";
import { setupFcm } from "../utils/saveFcmToken";
import { messaging } from "../firebase";
import { onMessage } from "firebase/messaging";
import {
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Search
} from "lucide-react";
import { useOutletContext } from "react-router-dom";

const AdminDashboard = () => {
  const { setNotifications } = useOutletContext();

  const [shops, setShops] = useState([]);
  const [approvedShops, setApprovedShops] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [declinedShops, setDeclinedShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("admin_token");
  const [selectedRow, setSelectedRow] = useState(null);

useEffect(() => {
  const loadAll = async () => {
    try {
      await setupFcm();
      await loadPendingShops();
      await loadApprovedShops();
      await loadDeclinedShops();

      const notifRes = await getAdminNotifications();

      setNotifications(notifRes.data.data || []);

      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  loadAll();
}, []);

useEffect(() => {
  onMessage(messaging, async (payload) => {
    console.log("🔥 Foreground Notification:", payload);

    new Notification(payload.notification.title, {
      body: payload.notification.body,
    });

     // ✅ THIS LINE FIXES BELL INSTANT UPDATE
    const res = await getAdminNotifications();
    setNotifications([...(res.data.data || [])]);
  });
}, []);

  const loadPendingShops = async () => {
    try {
      const res = await getPendingShops(token);
      const data = res.data.pending_vendors || [];

data.sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);

setShops(data);

    } catch (err) {
      console.error("Error loading shops:", err);
    }
  };

  const loadApprovedShops = async () => {
    try {
      const res = await getApprovedShops(token);
      const data = res.data.data || [];

data.sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);

setApprovedShops(data);

    } catch (err) {
      console.error("Error loading approved shops:", err);
    }
  };

  const handleApprove = async (id) => {
    await approveShop(id, token);
    alert("✅Shop Approved!");
    loadPendingShops();
    loadApprovedShops();
  };

  const handleDecline = async (id) => {
  try {
    await declineShop(id, token);

    alert("❌Shop Declined!");

    // Remove from pending list
    const declinedShop = shops.find((s) => s.id === id);
    setShops(shops.filter((s) => s.id !== id));

    // Add to declined list (optional)
    setDeclinedShops((prev) => [...prev, declinedShop]);

  } catch (err) {
    console.error("Decline error:", err);
    alert("Failed to decline shop");
  }
};
const loadDeclinedShops = async () => {
  try {
    const res = await getDeclinedShops();
    const data = res.data.data || [];

data.sort(
  (a, b) => new Date(b.created_at) - new Date(a.created_at)
);

setDeclinedShops(data);

  } catch (err) {
    console.error("Error loading declined shops:", err);
  }
};
const filterShops = (shopsArray) => {
  return shopsArray.filter((shop) =>
    (
      shop.shop_name +
      shop.owner_name +
      shop.email +
      shop.phone +
      shop.business_type
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
};



  if (loading) {
  return <SkeletonDashboard />; // 🔥 ADD THIS
}

return (
  <div className="admin-container admin-dashboard-page">
     
     
<div className="admin-header">

  <div className="status-navbar">
    <button
      className={`tab ${activeTab === "pending" ? "active" : ""}`}
      onClick={() => setActiveTab("pending")}
    >
      <Clock size={16} /> New Requests <span>{shops.length}</span>
    </button>

    <button
      className={`tab ${activeTab === "approved" ? "active" : ""}`}
      onClick={() => setActiveTab("approved")}
    >
      <CheckCircle size={16} /> Approved <span>{approvedShops.length}</span>
    </button>

    <button
      className={`tab ${activeTab === "declined" ? "active" : ""}`}
      onClick={() => setActiveTab("declined")}
    >
      <XCircle size={16} /> Declined <span>{declinedShops.length}</span>
    </button>
  </div>

  <div className="admin-search">
    <Search className="search-icon" size={18} />
    <input
      type="text"
      placeholder="Search by shop name"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </div>
  

</div>

  


      {activeTab === "pending" && (
  shops.length === 0 ? (
    <p className="no-data">No shops waiting for approval.</p>
  ) : (
<div className="table-scroll">
  <table className="shop-table">

    <thead>
      <tr>
        <th>S.No</th>
        <th>Shop Name</th>
        <th>Owner</th>
        <th>Address</th>
        <th>Phone</th>
        <th>Business Type</th>
        <th>Opening Time</th>
        <th>Closing Time</th>
        <th>Registered On</th>
        <th>Actions</th>
        
      </tr>
    </thead>

    <tbody>
      {filterShops(shops).map((shop, index) => (
       <tr
  key={shop.id}
  onClick={() => setSelectedRow(shop.id)}
  className={selectedRow === shop.id ? "active-row" : ""}
>

          <td>{index + 1}</td>
          <td className="shop-name">
            {shop.shop_name}
          </td>

          <td>{shop.owner_name}</td>

            <td 
  className="address-cell"
  onClick={(e) => {
    e.stopPropagation();   // 🔥 IMPORTANT
    setViewId(shop.address);
  }}
>
  {shop.address?.length > 25 
    ? shop.address.slice(0, 25) + "..." 
    : shop.address}
</td>

          <td>{shop.phone || "-"}</td>

          <td>
 <span
  className={`business-badge badge-${shop.business_type
    ?.toLowerCase()
    .replace(/\s+/g, "-")}`}
>
  {shop.business_type}
</span>
</td>
          <td>
  {shop.opening_time
    ? new Date(`1970-01-01T${shop.opening_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>
          <td>
  {shop.closing_time
    ? new Date(`1970-01-01T${shop.closing_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>

          <td>
            {new Date(shop.created_at).toLocaleString()}
          </td>

          <td className="actions">

            <button
              onClick={() => handleApprove(shop.id)}
              className="approve-btn"
            >
              <Check size={18} />
            </button>

            <button
              onClick={() => handleDecline(shop.id)}
              className="decline-btn"
            >
              <X size={18} />
            </button>

          </td>

        </tr>
      ))}
    </tbody>

  </table>
  </div>
  )
)}
      {/* APPROVED SHOPS */}
      {activeTab === "approved" && (
  <>
    {activeTab === "approved" && (
  approvedShops.length === 0 ? (
    <p className="no-data">No approved shops yet.</p>
  ) : (
    <div className="table-scroll">
    <table className="shop-table">

      <thead>
        <tr>
          <th>S.No</th>
          <th>Shop Name</th>
          <th>Owner</th>
          <th>Address</th>
          <th>Phone</th>
          <th>Business Type</th>
           <th>Opening Time</th>
          <th>Closing Time</th>
          <th>Approved On</th>
         
        </tr>
      </thead>

      <tbody>
        {filterShops(approvedShops).map((shop, index) => (
          <tr key={shop.id}>

            <td>{index + 1}</td>
            <td className="shop-name">
              {shop.shop_name}
            </td>

            <td>{shop.owner_name}</td>

           <td 
  className="address-cell"
  onClick={(e) => {
    e.stopPropagation();   // 🔥 IMPORTANT
    setViewId(shop.address);
  }}
>
  {shop.address?.length > 25 
    ? shop.address.slice(0, 25) + "..." 
    : shop.address}
</td>

            <td>{shop.phone || "-"}</td>

            <td>
  <span className={`business-badge ${
  shop.business_type === "Food"
    ? "badge-food"
    : "badge-grocery"
}`}>
  {shop.business_type}
</span>
</td>
            <td>
  {shop.opening_time
    ? new Date(`1970-01-01T${shop.opening_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>
            <td>
  {shop.closing_time
    ? new Date(`1970-01-01T${shop.closing_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>

            <td>
              {new Date(shop.created_at).toLocaleString()}
            </td>

          </tr>
        ))}
      </tbody>

    </table>
    </div>
  )
)}

  </>
)}
{/* DECLINED SHOPS */}
{activeTab === "declined" && (
  declinedShops.length === 0 ? (
    <p className="no-data">No declined shops.</p>
  ) : (
    <div className="table-scroll">
    <table className="shop-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>Shop Name</th>
          <th>Owner</th>
          <th>Address</th>
          <th>Phone</th>
          <th>Business Type</th>
           <th>Opening Time</th>
          <th>Closing Time</th>
          <th>Registered On</th>
         
        </tr>
      </thead>

      <tbody>
        {filterShops(declinedShops).map((shop, index) => (
          <tr key={shop.id}>
            <td>{index + 1}</td>
            <td className="shop-name">{shop.shop_name}</td>
            <td>{shop.owner_name}</td>
          <td 
  className="address-cell"
  onClick={(e) => {
    e.stopPropagation();   // 🔥 VERY IMPORTANT
    setViewId(shop.address);
  }}
>
  {shop.address?.length > 25 
    ? shop.address.slice(0, 25) + "..." 
    : shop.address}
</td>
            <td>{shop.phone}</td>
            <td>
 <span
  className={`business-badge badge-${shop.business_type
    ?.toLowerCase()
    .replace(/\s+/g, "-")}`}
>
  {shop.business_type}
</span>
</td>
            <td>
  {shop.opening_time
    ? new Date(`1970-01-01T${shop.opening_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>
            <td>
  {shop.closing_time
    ? new Date(`1970-01-01T${shop.closing_time}`).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-"}
</td>
            <td>{new Date(shop.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  )
)}
{viewId && (
  <div
    className="address-popup-overlay"
    onClick={() => setViewId(null)}
  >
    <div
      className="address-popup"
      onClick={(e) => e.stopPropagation()}
    >
      <h3>Full Address</h3>
      <p>{viewId}</p>
      <button onClick={() => setViewId(null)}>Close</button>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminDashboard;