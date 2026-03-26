/* ===== STAT CARD ===== */
const SkeletonStatCard = () => {
  return (
    <div className="sk-stat-card">
      <div className="sk-stat-icon shimmer"></div>

      <div className="sk-stat-text">
        <div className="sk-line shimmer"></div>
        <div className="sk-line small shimmer"></div>
      </div>
    </div>
  );
};

/* ===== TABLE ===== */
const SkeletonTable = () => {
  return (
    <div className="sk-table-container">

      {/* HEADER */}
      <div className="sk-table-header">
        {Array(10).fill().map((_, i) => (
          <div key={i} className="sk-header-cell shimmer"></div>
        ))}
      </div>

      {/* ROWS */}
      {[...Array(6)].map((_, i) => (
        <div className="sk-row" key={i}>
          {Array(10).fill().map((_, j) => (
            <div key={j} className="sk-cell shimmer"></div>
          ))}
        </div>
      ))}

    </div>
  );
};

/* ===== MAIN ===== */
export default function SkeletonDashboard() {
  return (
    <div className="sk-dashboard">

      {/* TOP STATS */}
      <div className="sk-stats-grid">
        {Array(4).fill().map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* TABLE */}
      <SkeletonTable />

    </div>
  );
}