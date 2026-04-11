import CountUp from "react-countup";

export default function KPICard({ title, value, change, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-title">{title}</div>

      <div className="kpi-value">
        {title === "Revenue" && "₹"}
        <CountUp
          end={Number(value)}
          duration={1.5}
          separator=","
        />
      </div>

      <div className={`kpi-change ${color}`}>
        {change}
      </div>
    </div>
  );
}