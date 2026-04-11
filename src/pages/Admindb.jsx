import { useEffect, useState } from "react";

import KPICard from "../components/admin/KPIcard";
import OrdersChart from "../components/admin/OrdersChart";
import RevenueChart from "../components/admin/RevenueChart";
import TopShops from "../components/admin/TopShops";
import RecentShops from "../components/admin/RecentShops";
import LatestOrders from "../components/admin/LatestOrders";

import { getDashboardData } from "../services/dashboardService";

import "../styles/Admindb.css";

export default function Admindb() {

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDashboardData();
      setDashboard(data);
    };

    fetchData();
  }, []);

  if (!dashboard) return <p>Loading...</p>;

  // 🔥 FORMAT DATA
  const formattedOrders = dashboard.ordersPerDay.map(item => ({
    day: item.day.slice(0, 3),
    count: item.count
  }));

  return (
    <div className="admin-dashboard">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Platform Overview</p>
        </div>
      </div>

      {/* 🔥 KPI */}
      <div className="kpi-grid">
        <KPICard title="Total Shops" value={dashboard.totalShops} />
        <KPICard title="Active Shops" value={dashboard.activeShops} />
        <KPICard title="Total Orders" value={dashboard.totalOrders} />
        <KPICard title="Revenue" value={dashboard.revenue} />
        <KPICard title="Pending Approvals" value={dashboard.pendingApprovals} />
      </div>
      
      {/* 🔥 CHART */}
      <div className="charts-grid">
        <OrdersChart data={formattedOrders} />  {/* 🔥 IMPORTANT */}
        <RevenueChart />
      </div>

      {/* BOTTOM */}
      <div className="bottom-grid">
        <TopShops />
        <RecentShops data={dashboard.latestShops} />
<LatestOrders data={dashboard.latestOrders} />
      </div>

    </div>
  );
}