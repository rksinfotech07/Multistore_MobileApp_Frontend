import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/AddProduct.css";
import { getRegisteredShops, getCategoryCounts } from "../../services/shopService";

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
    console.log("SHOP DATA:", shop);
    const shopName = shop.shop_name?.toLowerCase() || "";
    const email = shop.email?.toLowerCase() || "";
    const category = shop.category?.toLowerCase() || "";

    return (
      shopName.includes(shopSearch.toLowerCase()) &&
      category.includes(categorySearch.toLowerCase())
    );
  });

  return (
    <div className="addproduct-page">

      {/* 🔥 Banner */}
      <div className="addproduct-banner">
        <div className="banner-content banner-row">

          <div className="banner-left">
            <h1 className="banner-title">Add Product Panel</h1>
          </div>

          <div className="banner-right">

            <div className="search-group">
              <input
                type="text"
                placeholder="Search Shop Name..."
                className="search-input"
                value={shopSearch}
                onChange={(e) => setShopSearch(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="search-group">
              <input
                type="text"
                placeholder="Search Category..."
                className="search-input"
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
              />
              <span className="search-icon">📂</span>
            </div>

          </div>

        </div>
      </div>

      {/* 🔥 State Cards */}
      <div className="stats-section">

        <div className="stat-card">
          <div className="stat-icon food-icon">🍔</div>
          <div>
            <p className="stat-label">Food</p>
            <h2 className="stat-number">{getCount("Food")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon grocery-icon">🛒</div>
          <div>
            <p className="stat-label">Grocery</p>
            <h2 className="stat-number">{getCount("Grocery")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pharmacy-icon">💊</div>
          <div>
            <p className="stat-label">Pharmacy</p>
            <h2 className="stat-number">{getCount("Pharmacy")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon electronics-icon">💻</div>
          <div>
            <p className="stat-label">Electronics</p>
            <h2 className="stat-number">{getCount("Electronics")}</h2>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cosmetics-icon">💄</div>
          <div>
            <p className="stat-label">Cosmetics</p>
            <h2 className="stat-number">{getCount("Cosmetics")}</h2>
          </div>
        </div>

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
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    Loading shops...
                  </td>
                </tr>
              ) : filteredShops.length === 0 ? (
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
