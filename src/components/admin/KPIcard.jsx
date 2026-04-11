import CountUp from "react-countup";
import { Store, Activity, Package, IndianRupee, Clock } from "lucide-react";

export default function KPICard({ title, value, change }) {

  const getIcon = () => {
    switch (title) {
      case "Total Shops":
        return <Store size={18} />;
      case "Active Shops":
        return <Activity size={18} />;
      case "Total Orders":
        return <Package size={18} />;
      case "Revenue":
        return <IndianRupee size={18} />;
      case "Pending Approvals":
        return <Clock size={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="kpi-card">

      {/* 🔥 HEADER ROW */}
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>

        <div className="kpi-icon">
          {getIcon()}
        </div>
      </div>

      {/* 🔥 VALUE */}
      <div className="kpi-value">
        <CountUp
          end={Number(value)}
          duration={1.5}
          separator=","
          prefix={title === "Revenue" ? "₹" : ""}
        />
      </div>

      {/* CHANGE */}
      {change && <div className="kpi-change">{change}</div>}

    </div>
  );
}