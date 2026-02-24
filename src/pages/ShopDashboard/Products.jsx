import API from "../../api/axios";
import { useState, useEffect } from "react";
import NewProductModal from "../../components/Shop/NewProductModal";
import { getAllProducts } from "../../services/shopProductService";

import {
  deleteProductAPI,
} from "../../services/productService";
import "../../styles/Shop/Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getAllProducts();
      console.log("🔥 API PRODUCTS RESPONSE:", data);
      setProducts(data);
    } catch (err) {
      console.error("Load Products Failed", err);
    }
  };

  const addProduct = async () => {
    await loadProducts();
    setOpenModal(false);
  };

  const deleteProduct = async (id) => {
    try {
      await deleteProductAPI(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const groupBySubCategory = (items) => {
    return items.reduce((acc, item) => {
      const key = item.subcategory || "Others";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  };

  const toggleLiveStatus = async (product) => {
    try {
      const updatedStatus = !product.is_live;
      const productId = product.id || product._id;

      await API.patch(
        `/api/products/${productId}/toggle-live`,
        {
          stock: product.stock,
          is_live: updatedStatus,
          prep_time: product.prep_time || 0,
        }
      );

      setProducts((prev) =>
        prev.map((p) =>
          (p.id || p._id) === productId
            ? { ...p, is_live: updatedStatus }
            : p
        )
      );
    } catch (err) {
      console.error("Failed to update live status", err);
      alert("Unable to update product live status");
    }
  };

  const filteredProducts = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.subcategory?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="products-page">
      <div className="catalog-banner">
        <div>
          <h2>All Products</h2>
          <p>ACTIVE LISTINGS : {products.length} PRODUCTS</p>
        </div>

        <div className="catalog-actions">
          <input
            type="text"
            className="catalog-search"
            placeholder="Search by product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
<div className="products-grid-wrapper">

  {filteredProducts.length === 0 ? (

    /* ⭐ EMPTY STATE (LIKE YOUR SCREENSHOT) */
    <div className="empty-state">
      <div className="empty-icon">📦</div>

      <h3>No Products Yet</h3>

      <p>
        Your product catalog is empty. Add items to start selling and
        manage your inventory.
      </p>
    </div>

  ) : (

    Object.entries(groupBySubCategory(filteredProducts)).map(
      ([subCategory, items]) => (
        <div key={subCategory} className="subcategory-section">
          <h3 className="subcategory-title">
            {subCategory}
            <span className="count"> ({items.length})</span>
          </h3>

          <div className="products-grid">
            {items.map((p) => {
              const IMAGE_BASE = import.meta.env.VITE_IMAGE_URL;
              const imageUrl =
                !p.image || p.image === "default-product.png"
                  ? "/image.jpg"
                  : `${IMAGE_BASE}/uploads/${p.image}`;

              const finalPrice =
                p.final_price !== null && p.final_price !== undefined
                  ? p.final_price
                  : p.price;

              const hasDiscount =
                p.final_price &&
                p.price &&
                p.final_price < p.price;

              return (
                <div
                  key={p.id || p._id}
                  className={`product-card ${!p.is_live ? "card-off" : ""}`}
                >
                  <div className="img-wrapper">
                    <img src={imageUrl} alt={p.name} />

                    {hasDiscount && (
                      <div className="discount-badge">
                        -{Math.round(
                          ((p.price - p.final_price) / p.price) * 100
                        )}%
                      </div>
                    )}
                  </div>

                  <div className="card-body">
                    <h3>{p.name}</h3>

                    <div className="price-row">
                      <span className="final-price">
                        ₹{finalPrice}
                      </span>

                      {hasDiscount && (
                        <span className="mrp">
                          ₹{p.price}
                        </span>
                      )}
                    </div>

                    <div className="bottom-row">
                      <div className="stock-section">
                        {p.category === "Food" ? (
                          <span className="units-text">
                            ⏱ {p.preparing_minutes || p.prep_time || 0} min
                          </span>
                        ) : (
                          <span className="units-text">
                            Available: {p.stock}
                          </span>
                        )}

                        <button
                          onClick={() => toggleLiveStatus(p)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full
                          transition-colors duration-300
                          ${p.is_live ? "bg-green-500" : "bg-gray-300"}`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow
                            transition-transform duration-300
                            ${p.is_live ? "translate-x-5" : "translate-x-1"}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )
    )

  )}

</div>

      {deleteId && (
        <div className="confirm-overlay">
          <div className="confirm-box">
            <h3>Delete Product?</h3>
            <p>Are you sure you want to delete this product?</p>

            <div className="confirm-actions">
              <button
                className="cancel-btn"
                onClick={() => setDeleteId(null)}
              >
                No
              </button>

              <button
                className="confirm-btn"
                onClick={async () => {
                  await deleteProduct(deleteId);
                  setDeleteId(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <NewProductModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditProduct(null);
        }}
        onDeploy={addProduct}
        product={editProduct}
      />
    </div>
  );
}
