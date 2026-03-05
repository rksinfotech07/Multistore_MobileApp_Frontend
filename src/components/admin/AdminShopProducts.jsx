import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/AdminShopProducts.css";
import { ArrowLeft } from "lucide-react";
import NewProductModal from "../../components/Shop/NewProductModal";
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
  const [shopCategory, setShopCategory] = useState("");
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
      // 🔥 1. Fetch products
      const productsData = await getShopProducts(id);
      setProducts(productsData);

      // 🔥 2. Fetch shop details
      const shopData = await getSingleShop(id);
      setShopName(shopData.shop_name);
      const formattedCategory = shopData.category
        ? shopData.category.charAt(0).toUpperCase() + shopData.category.slice(1).toLowerCase()
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
  const handleEdit = (product) => {
    setEditProduct(product);
    setOpenModal(true);
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

  return (
    <div className="admin-products-page">
     <button className="back-btn" onClick={() => navigate(-1)}>
  <ArrowLeft size={18} />
  Back
</button>

      <div className="shop-banner">
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
            <input
              type="text"
              placeholder="Search by product"
              className="shop-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <button
              className="shop-new-btn"
              onClick={() => setOpenModal(true)}
            >
              + NEW PRODUCT
            </button>
          </div>

        </div>
      </div>

      <div className="products-table-section">
        <h3 className="table-title">Product List</h3>

        <table className="products-table">
          <thead>
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
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete-icon"
                      onClick={() => handleDelete(product.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
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
