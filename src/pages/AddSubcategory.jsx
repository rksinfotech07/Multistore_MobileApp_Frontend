import React, { useEffect, useState } from "react";
import "../styles/AddSubcategory.css";
import {
  getCategories,
  getSubcategories,
  addSubCategory,
  updateSubCategory
} from "../services/adminService";
import { Pencil } from "lucide-react";

const AddSubcategory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res);
  };

  const handleCategoryClick = async (cat) => {
    setSelectedCategory(cat);
    setShowForm(false);

    const res = await getSubcategories(cat.id);
    setSubcategories(res);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("icon", icon);
    if (image) formData.append("image", image);

    try {
      if (editMode) {
        await updateSubCategory(editingId, formData);
        alert("✅ Updated!");
      } else {
        await addSubCategory(selectedCategory.id, formData);
        alert("✅ Added!");
      }

      setName("");
      setIcon("");
      setImage(null);
      setShowForm(false);
      setEditMode(false);

      handleCategoryClick(selectedCategory);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (sub) => {
    setName(sub.name);
    setIcon(sub.icon);
    setImage(null);

    setEditingId(sub.id);
    setEditMode(true);
    setShowForm(true);
  };

  return (
    <div className="add-sub-container">

      <h2 className="add-sub-title">Categories</h2>

      {/* ✅ CATEGORY CARDS */}
      <div className="add-sub-category-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`add-sub-category-card ${
              selectedCategory?.id === cat.id ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(cat)}
          >
            <h3 className="add-sub-category-title">
  <span className="add-sub-category-icon-box">{cat.icon}</span>
  {cat.name}
</h3>
          </div>
        ))}
      </div>

      {/* ✅ SUBCATEGORIES */}
      {selectedCategory && (
        <>
          <div className="add-sub-header">
            <h3 className="add-sub-subcategory-title">Subcategories of {selectedCategory.name}</h3>

            <button
              className="add-sub-main-btn"
              onClick={() => {
                setEditMode(false);
                setName("");
                setIcon("");
                setImage(null);
                setShowForm(true);
              }}
            >
              + Add Subcategory
            </button>
          </div>

         <div className="add-sub-subcategory-grid">
  {subcategories.map((sub) => (
    <div key={sub.id} className="sub-card">

      {/* 🔝 TOP SECTION */}
      <div className="sub-card-top">

        {sub.image_url ? (
          <img src={sub.image_url} alt="" />
        ) : (
          <div className="sub-icon">{sub.icon}</div>
        )}

        {/* EDIT BUTTON */}
        <button
          className="sub-edit"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(sub);
          }}
        >
            <Pencil size={16} />
          Edit
        </button>

      </div>

      {/* 🔽 BOTTOM SECTION */}
      <div className="sub-card-bottom">
        <h4>{sub.icon} {sub.name}</h4>
      </div>

    </div>
  ))}
</div>
        </>
      )}

      {/* ✅ MODAL */}
      {showForm && (
        <div className="add-sub-modal-overlay">
          <div className="add-sub-modal">

            <span
              className="add-sub-close-btn"
              onClick={() => setShowForm(false)}
            >
              ✖
            </span>

            <h3>
              {editMode
                ? "Edit Subcategory"
                : `Add Subcategory to ${selectedCategory.name}`}
            </h3>

            <form onSubmit={handleSubmit} className="add-sub-modal-form">
              <input
                type="text"
                placeholder="Subcategory Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="text"
                placeholder="Icon (emoji)"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />

              <button type="submit">
                {editMode ? "Update SubCategory" : "Add SubCategory"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSubcategory;