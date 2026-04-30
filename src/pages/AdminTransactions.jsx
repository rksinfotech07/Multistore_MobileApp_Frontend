import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  Search,
  Download,
  Eye,
  X,
  RefreshCw,
  CalendarDays,
  Filter,
} from "lucide-react";
import { getAllTransactions } from "../services/transactionService";
import SkeletonDashboard from "../components/common/SkeletonDashboard";
import "../styles/AdminTransactions.css";

/* ─────────────────────────────────────────
   HELPER: format currency
───────────────────────────────────────── */
const fmt = (amount) =>
  `₹${parseFloat(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ─────────────────────────────────────────
   HELPER: badge class from Easybuzz status
   possible values: success | failed | pending | usercancel | initiated
───────────────────────────────────────── */
const statusClass = (s = "") => s.toLowerCase().replace(/\s+/g, "");

/* ─────────────────────────────────────────
   EXPORT TO CSV
───────────────────────────────────────── */
const exportCSV = (data) => {
  const headers = [
    "Txn ID",
    "Order ID",
    "Customer Name",
    "Customer Phone",
    "Amount (₹)",
    "Payment Mode",
    "Status",
    "Bank Ref No",
    "Date",
  ];

  const rows = data.map((t) => [
    t.txnid,
    t.order_id || t.udf1 || "-",
    t.firstname || t.name || "-",
    t.phone || "-",
    parseFloat(t.amount || 0).toFixed(2),
    t.mode || t.payment_mode || "-",
    t.status,
    t.bank_ref_num || "-",
    t.addedon || t.date || "-",
  ]);

  const csv =
    [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

/* ═══════════════════════════════════════════
   DETAIL MODAL
═══════════════════════════════════════════ */
function TransactionModal({ txn, onClose }) {
  if (!txn) return null;

  const fields = [
    { label: "Transaction ID", value: txn.txnid },
    { label: "Order ID", value: txn.order_id || txn.udf1 || "-" },
    { label: "Customer Name", value: txn.firstname || txn.name || "-" },
    { label: "Phone", value: txn.phone || "-" },
    { label: "Amount", value: fmt(txn.amount) },
    { label: "Payment Mode", value: txn.mode || txn.payment_mode || "-" },
    { label: "Status", value: txn.status },
    { label: "Bank Ref No", value: txn.bank_ref_num || "-" },
    { label: "Easybuzz Txn ID", value: txn.easepayid || "-" },
    { label: "PG Type", value: txn.pg_type || "-" },
    { label: "Card Number", value: txn.card_no ? `xxxx xxxx xxxx ${txn.card_no.slice(-4)}` : "-" },
    { label: "Date", value: txn.addedon || txn.date || "-", fullWidth: true },
    { label: "Product Info", value: txn.productinfo || "-", fullWidth: true },
    { label: "Hash", value: txn.hash || "-", fullWidth: true },
  ];

  return (
    <div className="txn-modal-overlay" onClick={onClose}>
      <div className="txn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="txn-modal-header">
          <h3>🧾 Transaction Detail</h3>
          <button className="txn-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="txn-modal-body">
          <div className="txn-detail-grid">
            {fields.map(({ label, value, fullWidth }) => (
              <div
                key={label}
                className={`txn-detail-item ${fullWidth ? "full-width" : ""}`}
              >
                <label>{label}</label>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
/* ── DATE HELPERS ── */
const todayStr = () => new Date().toISOString().slice(0, 10);
const firstOfMonthStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [selectedTxn, setSelectedTxn] = useState(null);

  /* ── DATE RANGE STATE (defaults: 1st of month → today) ── */
  const [startDate, setStartDate] = useState(firstOfMonthStr);
  const [endDate, setEndDate]     = useState(todayStr);

  /* ── FETCH (passes date range to backend) ── */
  const fetchTransactions = async () => {
    setLoading(true);
    const data = await getAllTransactions(startDate, endDate);
    setTransactions(Array.isArray(data) ? data : data?.transactions || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── CLIENT-SIDE FILTER (search + status + mode + date range) ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const from = startDate ? new Date(startDate) : null;
    const to   = endDate   ? new Date(endDate + "T23:59:59") : null;

    return transactions.filter((t) => {
      const matchSearch =
        !q ||
        (t.txnid || "").toLowerCase().includes(q) ||
        (t.firstname || t.name || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q) ||
        (t.phone || "").toLowerCase().includes(q) ||
        (t.order_id || t.udf1 || "").toLowerCase().includes(q) ||
        (t.bank_ref_num || "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "all" ||
        (t.status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchMode =
        modeFilter === "all" ||
        (t.mode || t.payment_mode || "").toLowerCase() === modeFilter.toLowerCase();

      /* date filter — works on addedon or date field */
      const raw = t.addedon || t.date;
      const txDate = raw ? new Date(raw) : null;
      const matchDate =
        !txDate ||
        ((!from || txDate >= from) && (!to || txDate <= to));

      return matchSearch && matchStatus && matchMode && matchDate;
    });
  }, [transactions, search, statusFilter, modeFilter, startDate, endDate]);

  /* ── STATS ── */
  const stats = useMemo(() => {
    const success = transactions.filter(
      (t) => (t.status || "").toLowerCase() === "success"
    );
    const failed = transactions.filter((t) =>
      ["failed", "failure"].includes((t.status || "").toLowerCase())
    );
    const pending = transactions.filter(
      (t) => (t.status || "").toLowerCase() === "pending"
    );
    const total = success.reduce(
      (sum, t) => sum + parseFloat(t.amount || 0),
      0
    );
    return { success: success.length, failed: failed.length, pending: pending.length, total };
  }, [transactions]);

  /* ── UNIQUE MODES for filter dropdown ── */
  const paymentModes = useMemo(() => {
    const s = new Set(
      transactions.map((t) => t.mode || t.payment_mode).filter(Boolean)
    );
    return [...s];
  }, [transactions]);

  if (loading) return <SkeletonDashboard />;

  return (
    <div className="txn-container">
      {/* ── HEADER ── */}
      <div className="txn-header">
        <h2 className="txn-title">
          <CreditCard className="txn-title-icon" />
          Transaction History
        </h2>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="txn-stats">
        <div className="txn-stat-card">
          <span className="txn-stat-label">Total Transactions</span>
          <span className="txn-stat-value">{transactions.length}</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-label">Successful</span>
          <span className="txn-stat-value success">{stats.success}</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-label">Failed</span>
          <span className="txn-stat-value failed">{stats.failed}</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-label">Pending</span>
          <span className="txn-stat-value pending">{stats.pending}</span>
        </div>
        <div className="txn-stat-card">
          <span className="txn-stat-label">Total Collected</span>
          <span className="txn-stat-value amount">{fmt(stats.total)}</span>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="txn-toolbar">

        {/* ── ROW 1: Search + Status + Mode ── */}
        <div className="txn-toolbar-row">
          {/* Search */}
          <div className="txn-search-wrap">
            <Search className="txn-search-icon" />
            <input
              type="text"
              placeholder="Search by Txn ID, Order ID, name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <select
            className="txn-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
            <option value="usercancel">User Cancelled</option>
            <option value="initiated">Initiated</option>
          </select>

          {/* Payment mode filter */}
          <select
            className="txn-filter-select"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">All Modes</option>
            {paymentModes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* ── ROW 2: Date range (left) + Refresh + Export (right) ── */}
        <div className="txn-toolbar-row txn-toolbar-row--between">

          {/* LEFT: From — To — Apply */}
          <div className="txn-date-group">
            <div className="txn-date-field">
              <label className="txn-date-label">
                <CalendarDays size={12} />
                From
              </label>
              <input
                type="date"
                className="txn-date-input"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <span className="txn-date-sep">—</span>

            <div className="txn-date-field">
              <label className="txn-date-label">
                <CalendarDays size={12} />
                To
              </label>
              <input
                type="date"
                className="txn-date-input"
                value={endDate}
                min={startDate}
                max={todayStr()}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <button
              className="txn-apply-btn"
              onClick={fetchTransactions}
              title="Apply date filter"
            >
              <Filter size={13} />
              Apply
            </button>
          </div>

          {/* RIGHT: Refresh + Export CSV */}
          <div className="txn-date-right">
            <button className="txn-icon-btn" onClick={fetchTransactions} title="Refresh">
              <RefreshCw size={14} />
              Refresh
            </button>
            <button
              className="txn-export-btn"
              onClick={() => exportCSV(filtered)}
              title="Export as CSV"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>

        </div>

      </div>

      {/* ── TABLE (headers always visible) ── */}
      <div className="txn-table-wrapper">
        <table className="txn-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Txn ID</th>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Bank Ref No</th>
              <th>Status</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={11} className="txn-empty">
                  <CreditCard size={36} />
                  <p>No transactions found.</p>
                </td>
              </tr>
            ) : (
              filtered.map((t, idx) => (
                <tr key={t.txnid || idx}>
                  <td>{idx + 1}</td>
                  <td>{t.txnid || "-"}</td>
                  <td>{t.order_id || t.udf1 || "-"}</td>
                  <td>{t.firstname || t.name || "-"}</td>
                  <td>{t.phone || "-"}</td>
                  <td className="txn-amount">{fmt(t.amount)}</td>
                  <td>
                    <span className="txn-mode">
                      {t.mode || t.payment_mode || "-"}
                    </span>
                  </td>
                  <td>{t.bank_ref_num || "-"}</td>
                  <td>
                    <span className={`txn-badge ${statusClass(t.status)}`}>
                      {t.status || "-"}
                    </span>
                  </td>
                  <td>
                    {t.addedon
                      ? new Date(t.addedon).toLocaleString("en-IN")
                      : t.date
                      ? new Date(t.date).toLocaleString("en-IN")
                      : "-"}
                  </td>
                  <td>
                    <button
                      className="txn-view-btn"
                      onClick={() => setSelectedTxn(t)}
                      title="View full details"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── DETAIL MODAL ── */}
      <TransactionModal
        txn={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </div>
  );
}
