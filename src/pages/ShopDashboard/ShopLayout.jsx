import { useState } from "react";
import Navbar from "../../components/Shop/Navbar";
import { Outlet } from "react-router-dom";
import "../../styles/Shop/Dashboard.css";

export default function ShopLayout() {

  /* ⭐ GLOBAL SHOP STATUS (ONLINE / OFFLINE) */
  const [shopActive, setShopActive] = useState(true);

  return (
    <div className="shop-container">

      {/* ⭐ Pass status to Navbar */}
      <Navbar
        shopActive={shopActive}
        setShopActive={setShopActive}
      />

      {/* ⭐ Pass status to all pages */}
      <main className="dashboard-page">
        <Outlet context={{ shopActive }} />
      </main>

    </div>
  );
}