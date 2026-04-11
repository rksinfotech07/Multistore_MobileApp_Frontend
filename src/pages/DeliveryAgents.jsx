import React, { useState, useEffect } from "react";
import "../styles/DeliveryAgents.css";
import {
  getDeliveryAgents,
  deleteDeliveryAgent,
  approveAgent,
  blockAgent
} from "../services/deliveryAgentService";
import {
  Trash2,
  Search,
  Phone,
  Mail,
  FileText,
  IdCard,
  CreditCard,
  Bike,
  Car,
  BadgeCheck,
  Ban,
  Unlock
} from "lucide-react";
import SkeletonDashboard from "../components/common/SkeletonDashboard";


const DeliveryAgents = () => {

  // 🔹 STATES
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteAgentId, setDeleteAgentId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showApproveToast, setShowApproveToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔹 FETCH FUNCTION (Moved ABOVE useEffect — only change)
 const fetchAgents = async () => {
  setLoading(true);
  try {
    const res = await getDeliveryAgents();

    console.log("API RESPONSE:", res);

    const data = res?.data || res?.agents || res || [];

const formatted = (Array.isArray(data) ? data : []).map(agent => ({
  ...agent,
  approved:
  agent.is_approved === "approved"
}));

setAgents(formatted);

  } catch (error) {
    console.error("Error fetching agents:", error);
    setAgents([]);
  }
  setLoading(false);
};


  // 🔹 EFFECT
  useEffect(() => {
    fetchAgents();
  }, []);

  // 🔹 HANDLERS

 
  const handleDelete = async () => {
    try {
      await deleteDeliveryAgent(deleteAgentId);

      setAgents(prev =>
        prev.filter(agent => agent.id !== deleteAgentId)
      );

      setDeleteAgentId(null);
      setShowSuccess(true);

      setTimeout(() => setShowSuccess(false), 2500);

    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
const handleApprove = async (agent) => {
  try {
    await approveAgent(agent.id);

    setAgents(prev =>
      prev.map(a =>
        a.id === agent.id
          ? { ...a, blocked: false, approved: true }
          : a
      )
    );

    // 🔥 ADD THIS
    setShowApproveToast(true);
    setTimeout(() => setShowApproveToast(false), 2000);

  } catch (error) {
    console.error("Approve failed:", error);
  }
};
const handleBlock = async (agent) => {
  try {
    const newStatus = !agent.blocked;

    await blockAgent(agent.id, newStatus);

    // ✅ UPDATE ONLY BLOCKED (DO NOT TOUCH APPROVED)
    setAgents(prev =>
      prev.map(a =>
        a.id === agent.id
          ? { ...a, blocked: newStatus }
          : a
      )
    );

  } catch (error) {
    console.error("Block failed:", error);
  }
};
  const filteredAgents = agents.filter((agent) =>
    agent.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone?.includes(searchTerm)
  );
  if (loading) {
  return <SkeletonDashboard />;
}

  return (
    <div className="agents-page">

      <div className="agents-header">

        <h2 className="agent-title">
          <BadgeCheck size={20} />
          Verified Delivery Agents
        </h2>

        <div className="search-box">

  <Search size={16} className="search-icon" />

  <input
    type="text"
    placeholder="Search by name, email, phone..."
    className="search-input"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />

</div>

      </div>

     <div className="agents-grid">
  {filteredAgents.map((agent) => (
    <div key={agent.id} className="agent-card">

      {/* DELETE */}
      <button
        className="delete-btn"
        onClick={() => setDeleteAgentId(agent.id)}
      >
        <Trash2 size={16} />
      </button>

      {/* HEADER */}
      <div className="agent-header">
        <h3>{agent.name}</h3>
      </div>

      {/* CONTACT ROW */}
      <div className="agent-contact">
        <span><Phone size={14} /> {agent.phone}</span>
        <span>|</span>
        <span><Mail size={14} /> {agent.email}</span>
        <span>|</span>

        <a
          href={agent.driving_license_url}
          target="_blank"
          rel="noreferrer"
          className="license-link"
        >
          <FileText size={14} /> View License
        </a>
      </div>

      {/* DETAILS ROW */}
      <div className="agent-info-row">
        <span><IdCard size={14} /> {agent.aadhar_number}</span>
        <span>|</span>
        <span><CreditCard size={14} /> {agent.pan_number}</span>
        <span>|</span>
        <span><Bike size={14} /> {agent.vehicle_type}</span>
        <span>|</span>
        <span><Car size={14} /> {agent.vehicle_number}</span>
      </div>

      {/* ACTION BUTTONS */}
  <div className="action-row">

  {/* ✅ ACCEPTED BADGE */}
  {agent.approved && (
    <span className="status-badge accepted">
      <BadgeCheck size={14} /> Accepted
    </span>
  )}

  {/* ✅ APPROVE BUTTON */}
  {!agent.approved && (
    <button
      className="delivery-approve-btn"
      onClick={() => handleApprove(agent)}
    >
      <BadgeCheck size={16} /> Approve
    </button>
  )}

  {/* 🔥 BLOCK / UNBLOCK */}
  <button
  className={`block-btn ${agent.blocked ? "unblock" : ""}`}
  onClick={() => handleBlock(agent)}
>
  {agent.blocked ? (
    <>
      <Unlock size={16} /> Unblock
    </>
  ) : (
    <>
      <Ban size={16} /> Block
    </>
  )}
</button>

</div>

    </div>   
  ))}        
</div>

{/* ✅ DELETE MODAL OUTSIDE */}
{deleteAgentId && (
  <div className="modal-overlay">
    <div className="modal">
      <h3 className="modal-title">Delete Agent?</h3>
      <p>Are you sure you want to delete this profile?</p>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setDeleteAgentId(null)}
        >
          Cancel
        </button>

        <button
          className="delete-confirm-btn"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

{/* ✅ SUCCESS MESSAGE OUTSIDE */}
{showSuccess && (
  <div className="success-toast">
    ✅ Profile deleted successfully
  </div>
)}
{showApproveToast && (
  <div className="success-toast">
    ✅ Accepted successfully
  </div>
)}

    </div>
  );
};

export default DeliveryAgents;
