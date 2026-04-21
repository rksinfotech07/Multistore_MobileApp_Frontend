import React, { useEffect, useState } from "react";
import "../styles/AddSubcategory.css";
import {
  getCategories,
  getSubcategories,
  addSubCategory,
  updateSubCategory
} from "../services/adminService";

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

  // ✅ LOAD CATEGORIES
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await getCategories();
    setCategories(res);
  };

  // ✅ CLICK CATEGORY
  const handleCategoryClick = async (cat) => {
    setSelectedCategory(cat);
    setShowForm(false);

    const res = await getSubcategories(cat.id);
    setSubcategories(res);
  };

  // ✅ ADD SUBCATEGORY
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

      handleCategoryClick(selectedCategory); // refresh
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

      <h2>Categories</h2>

      {/* ✅ CATEGORY CARDS */}
      <div className="add-sub-category-grid">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`add-sub-category-card ${
              selectedCategory?.id === cat.id ? "active" : ""
            }`}
          >
            <div onClick={() => handleCategoryClick(cat)}>
              <h3>{cat.icon} {cat.name}</h3>
            </div>

            {/* ➕ BUTTON */}
            <button
              className="add-sub-add-btn"
              onClick={(e) => {
  e.stopPropagation();   // VERY IMPORTANT

  setSelectedCategory(cat);
  setEditMode(false);    // ensure add mode
  setName("");           // clear old data
  setIcon("");
  setImage(null);

  setShowForm(true);     // open popup
}}
            >
              ➕
            </button>
          </div>
        ))}
      </div>

      {/* ✅ SUBCATEGORIES */}
      {selectedCategory && (
        <>
          <h3>Subcategories of {selectedCategory.name}</h3>

          <div className="add-sub-subcategory-grid">
            {subcategories.map((sub) => (
              <div
                key={sub.id}
                className="add-sub-subcategory-card"
              >

                {/* ✏️ EDIT BUTTON */}
                <button
                  className="add-sub-edit-btn"
                  onClick={(e) => {
  e.stopPropagation();   // VERY IMPORTANT
  handleEdit(sub);
}}
                >
                  ✏️
                </button>

                <p>{sub.icon} {sub.name}</p>

                {sub.image_url && (
                  <img src={sub.image_url} alt="" />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ✅ MODAL POPUP */}
      {showForm && (
        <div className="add-sub-modal-overlay">
          <div className="add-sub-modal">

            <div className="modal-header">
              <h3>
                {editMode
                  ? "Edit Subcategory"
                  : `Add Subcategory to ${selectedCategory.name}`}
              </h3>

              <span
                className="add-sub-close-btn"
                onClick={() => setShowForm(false)}
              >
                ✖
              </span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="add-sub-modal-form"
            >

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
                {editMode
                  ? "Update SubCategory"
                  : "Add SubCategory"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AddSubcategory;