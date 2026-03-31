import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/AdminShopProducts.css";
import { ArrowLeft,Search, Pencil, Trash2, PlusCircle } from "lucide-react";
import NewProductModal from "../../components/Shop/NewProductModal";
import ProductEmptyState from "../../components/Shop/ProductEmptyState";
import { getSingleProduct } from "../../services/adminShopProductService";
import { 
  getShopProducts,
  deleteShopProduct,
  toggleProductLive,
  getSingleShop,
} from "../../services/adminShopProductService";

const AdminShopProducts = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [shopName, setShopName] = useState("Shop");
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [shopCategory, setShopCategory] = useState(null);
  const [shopCategoryId, setShopCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");


  // 🔥 DELETE MODAL STATES
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // 🔥 SUCCESS MODAL STATE (NEW)
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Fetch Products
useEffect(() => {
  const fetchData = async () => {
    try {
      // 🔥 FETCH BOTH SAME TIME (FIX FOR COLOR DELAY)
const [productsData, shopData] = await Promise.all([
  getShopProducts(id),
  getSingleShop(id)
]);

setProducts(productsData);

setShopName(shopData.shop_name);

const formattedCategory = shopData.category
  ? shopData.category.toLowerCase()
  : "";

setShopCategory(formattedCategory);
setShopCategoryId(shopData.category_id);
    } catch (error) {
      console.error("Failed to fetch data 👉", error);
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchData();
  }
}, [id]);


  // ✅ Edit
  const handleEdit = async (product) => {
  try {
    const fullProduct = await getSingleProduct(product.id);

    setEditProduct(fullProduct);
    setOpenModal(true);
  } catch (error) {
    console.error(error);
  }
};

  // 🔥 OPEN DELETE MODAL
  const handleDelete = (productId) => {
    setDeleteId(productId);
    setShowDeleteModal(true);
  };

  // 🔥 CONFIRM DELETE
  const confirmDelete = async () => {
    try {
      await deleteShopProduct(deleteId);

      setProducts(prev =>
        prev.filter(p => p.id !== deleteId)
      );

      setShowDeleteModal(false);
      setDeleteId(null);

      // 🔥 SHOW SUCCESS POPUP (NEW)
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete product");
    }
  };

  // 🔥 TOGGLE WITH BACKEND CONNECTED
const handleToggle = async (productId) => {
  try {
    await toggleProductLive(productId);

    // UI update
    setProducts(prev =>
      prev.map(p =>
        p.id === productId
          ? { ...p, is_live: !p.is_live }
          : p
      )
    );

  } catch (error) {
    console.error(error);
    alert("❌ Failed to update status");
  }
};


  const handleDeploy = async () => {
    try {
      const data = await getShopProducts(id);
      setProducts(data);
    } catch (error) {
      console.error("Refresh error 👉", error);
    }
    setOpenModal(false);
  };
const getBannerClass = () => {
  switch (shopCategory) {
    case "food":
      return "banner-food";
    case "grocery":
      return "banner-grocery";
    case "electronics":
      return "banner-electronics";
    case "home appliances":
      return "banner-home";
    case "pharmacy":
      return "banner-pharmacy";
    case "cosmetics":
      return "banner-cosmetics";
    default:
      return "banner-default";
  }
};
const getTableClass = () => {
  switch (shopCategory) {
    case "food":
      return "banner-food";
    case "grocery":
      return "banner-grocery";
    case "electronics":
      return "banner-electronics";
    case "home appliances":
      return "banner-home";
    case "pharmacy":
      return "banner-pharmacy";
    case "cosmetics":
      return "banner-cosmetics";
    default:
      return "banner-default";
  }
};

  return (
    <div className="admin-products-page">
{shopCategory && (
      <div className={`shop-banner ${getBannerClass()}`}>
        <button className="banner-back-btn" onClick={() => navigate(-1)}>
  <ArrowLeft size={18} />
</button>
        <div className="circle-1"></div>
  <div className="circle-2"></div>
        <div className="shop-banner-content">

          <div>
            <h1 className="shop-banner-title">
              {shopName}
            </h1>

            <p className="shop-banner-subtitle">
              TOTAL PRODUCTS: {products.length}
            </p>
          </div>
        

          <div className="shop-banner-actions">
            <div className="search-box">
  <Search size={16} className="search-icon" />
  <input
    type="text"
    placeholder="Search products..."
    className="shop-search"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  </div>
  

   
            <button
              className="shop-new-btn"
              onClick={() => {
                setEditProduct(null);
                setOpenModal(true);
              }}
            >
              <PlusCircle size={18} />
              NEW PRODUCT
            </button>
          </div>

        </div>
      </div>
)} 

      <div className="products-table-section">
        <h3 className="table-title">Product List</h3>
        <div className="table-wrapper">
  {products.length === 0 ? (
    <ProductEmptyState onAdd={() => setOpenModal(true)} />
  ) : (
    <div className="table-scroll">
      <table className="products-table">
          <thead className={getTableClass()}>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Final Price</th>
              <th>Price</th>
              {products.some(p => p.category === "Food") ? (
  <>
    <th>Prep Time</th>
    <th>Food Type</th>
  </>
) : (
  <th>Stock</th>
)}

              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products
              .filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((product, index) => (
              <tr key={product.id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.subcategory || "-"}</td>
                <td>₹ {product.final_price}</td>
                <td>₹ {product.price}</td>
                {product.category === "Food" ? (
  <>
    <td>{product.preparing_minutes || "-"}</td>
    <td>{product.food_type || "-"}</td>
  </>
) : (
  <td>{product.stock}</td>
)}


                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={product.is_live}
                      onChange={() => handleToggle(product.id)}
                    />
                    <span className="slider"></span>
                  </label>
                </td>

                <td>
                  <div className="action-buttons">
                    <button
                      className="table-edit-btn"
                      onClick={() => handleEdit(product)}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="icon-btn delete-icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
        </div>
  )}
        </div>
      </div>

      {/* 🔥 DELETE MODAL */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-card">
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete this product?</p>

            <div className="delete-modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 SUCCESS POPUP (NEW) */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-icon">✔</div>
            <h3>Product Deleted Successfully</h3>
          </div>
        </div>
      )}

   <NewProductModal
  open={openModal}
  onClose={() => {
    setOpenModal(false);
    setEditProduct(null);
  }}
  onDeploy={handleDeploy}
  product={editProduct}
  shopId={id}
  shopCategory={shopCategory}
  shopCategoryId={shopCategoryId}   // 🔥 ADD THIS
/>


    </div>

  );
};

export default AdminShopProducts;