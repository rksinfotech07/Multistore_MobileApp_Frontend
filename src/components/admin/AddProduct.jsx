import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AddProduct.css";
import { getRegisteredShops, getCategoryCounts } from "../../services/shopService";
import { Search, Eye, PackagePlus, Apple, ShoppingCart, Cpu, Home, Pill, Sparkles } from "lucide-react";

const AddProduct = () => {

  const [shopSearch, setShopSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState([]);

  const navigate = useNavigate();

  const getCount = (type) => {
    const found = categoryCounts.find(
      (item) => item.business_type === type
    );
    return found ? found.shop_count : 0;
  };
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const shopRes = await getRegisteredShops();
      console.log("shopRes:", shopRes); // 🔥 ADD THIS LINE
  
      const countRes = await getCategoryCounts();

      if (isMounted) {
       setShops(shopRes || []);
      setCategoryCounts(countRes || []);
      }

    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };

}, []);


  
  // ✅ CLEAN & SIMPLE FILTER (FIXED)
  const filteredShops = shops.filter((shop) => {
  const search = shopSearch.toLowerCase();

  const shopName = shop.shop_name?.toLowerCase() || "";
  const phone = shop.phone?.toString() || "";
  const email = shop.email?.toLowerCase() || "";
  const category = shop.business_type?.toLowerCase() || "";

  return (
    shopName.includes(search) ||
    phone.includes(search) ||
    email.includes(search) ||
    category.includes(search)
  );
});

  return (
    <div className="addproduct-page">
      {/* 🔥 NEW HEADER */}
<div className="page-header">

  <div className="page-left"> 
    <h2 className="page-title"><PackagePlus size={20} />Products Insights</h2>
    <p className="page-subtitle">
      Explore shop products and categories
    </p>
  </div>
<div className="page-actions">

  <div className="search-group">
    <input
      type="text"
      placeholder="Search"
      className="search-input"
      value={shopSearch}
      onChange={(e) => setShopSearch(e.target.value)}
    />
    <Search className="search-icon" size={16} />
  </div>

</div>

</div>

      {/* 🔥 State Cards */}
      <div className="stats-section">
{[
  { title: "Food", icon: Apple, gradient: "gradient-food", count: getCount("Food") },
  { title: "Grocery", icon: ShoppingCart, gradient: "gradient-grocery", count: getCount("Grocery") },
  { title: "Electronics", icon: Cpu, gradient: "gradient-electronics", count: getCount("Electronics") },
  { title: "Home Appliances", icon: Home, gradient: "gradient-home", count: getCount("Home Appliances") },
  { title: "Pharmacy", icon: Pill, gradient: "gradient-pharmacy", count: getCount("Pharmacy") },
  { title: "Cosmetics", icon: Sparkles, gradient: "gradient-cosmetics", count: getCount("Cosmetics") },
].map((item) => {
  const Icon = item.icon;   // ✅ MOVE HERE

  return (
    <div key={item.title} className={`category-card ${item.gradient}`}>
      
      <div className="circle big"></div>
      <div className="circle small"></div>
      <div className="circle tiny"></div>

<div className="sparkle sparkle-1">✦</div>
<div className="sparkle sparkle-2">✦</div>

      <h3>{item.title}</h3>
      <span>{item.count} shops</span>

      <div className="icon">
        <Icon size={28} strokeWidth={1.5} />
      </div>

    </div>
  );
})}

</div>

      {/* 🔥 TABLE */}
      <div className="shop-table-section">
        <h2 className="table-title">Shop Category Overview</h2>

        <div className="table-wrapper">
          <table className="shop-table">
            <thead>
              <tr>
                <th>Shop Name</th>
               <th>Contact</th>
                <th>Category</th>
                <th>No of Products</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
  [...Array(5)].map((_, i) => (
    <tr key={i}>
      <td><div className="skeleton"></div></td>
      <td><div className="skeleton"></div></td>
      <td><div className="skeleton"></div></td>
      <td><div className="skeleton"></div></td>
      <td><div className="skeleton-btn"></div></td>
    </tr>
  ))
)
               : filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No shops found
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id}>
                    <td>{shop.shop_name}</td>
                     <td>
                      {shop.email || shop.phone || "-"}
                      </td>
                    <td>{shop.business_type}</td>
                    <td>{shop.product_count}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(`/shop/${shop.id}`, {
                            state: { category: shop.business_type }
                          })
                        }
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default AddProduct;
// Sowdha testing
