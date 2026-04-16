import { useEffect, useState } from "react";
import { Search, Pencil, Package } from "lucide-react";
import { getAllOrders, updateOrderNote } from "../services/adminOrderService";
import "../styles/AdminOrders.css";
import SkeletonDashboard from "../components/common/SkeletonDashboard";
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
const [showModal, setShowModal] = useState(false);
const [saved, setSaved] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
     setLoading(true); // 🔥 add this
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleSaveNote = async () => {
    await updateOrderNote(selectedOrder, noteInput);
    setSelectedOrder(null);
    setNoteInput("");
    fetchOrders();
  };
  
  if (loading) {
  return <SkeletonDashboard />;
}

 return (
  <div className="orders-container">
    <div className="orders-header">
<h2 className="orders-title">
  <Package size={22} className="orders-icon" />
  All Orders
</h2>
   <div className="orders-search-box">
  <div className="orders-search-input">
    <Search size={16} className="orders-search-icon" />
    <input
      type="text"
      placeholder="Search by customer, shop, status..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
    </div>
  </div>
</div>
<div className="table-wrapper">
    <table className="orders-table">
      <thead>
        <tr>
  <th>ID</th>
  <th>Customer</th>
  <th>Shop</th>
  <th>Delivery</th>   {/* NEW */}
  <th>Time taken</th>       {/* NEW */}
  <th>Date</th>       {/* NEW */}
  <th>Status</th>
  <th>Notes</th>
</tr>
      </thead>
      <tbody>
        {orders
  .filter((o) =>
    (o.customer || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.shop || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.status || "").toLowerCase().includes(searchTerm.toLowerCase())
  )
  .map((o) => (
          <tr key={o.order_id}>
            <td>{o.order_id}</td>
            <td>{o.customer}</td>
            <td>{o.shop}</td>
            <td>
        {o.delivery_partner ? o.delivery_partner : "-"}
      </td>
           <td>
        {o.time_taken ? `${o.time_taken} min` : "-"}
      </td>

      <td>
        {o.date ? new Date(o.date).toLocaleString() : "-"}
      </td>

            <td>
              <span className={`status ${o.status}`}>
                {o.status}
              </span>
            </td>

            <td>
              <button
  className="note-btn"
  onClick={() => {
    setSelectedOrder(o.order_id);
    setNoteInput(o.notes || "");
    setShowModal(true);
  }}
>
  <Pencil size={16} />
</button>  
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>

    {/* NOTE INPUT */}
    {showModal && (
  <div className="modal-overlay">
    <div className="modal-box">
     <h3>{noteInput ? "Edit Note ✏️" : "Add Note 📝"}</h3>

      <textarea
        value={noteInput}
        onChange={(e) => setNoteInput(e.target.value)}
        placeholder="Enter note..."
      />

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setShowModal(false)}
        >
          Cancel
        </button>

        <button
          className="save-btn"
        onClick={async () => {
  await updateOrderNote(selectedOrder, noteInput);
  setSaved(true);

  setTimeout(() => {
    setSaved(false);
    setShowModal(false);
    setNoteInput("");
    fetchOrders();
  }, 1000);
}}
        >
          Save
        </button>
      </div>
      {saved && <p className="success-msg">✔ Saved successfully</p>}
    </div>
  </div>
)}
  </div>
);
}