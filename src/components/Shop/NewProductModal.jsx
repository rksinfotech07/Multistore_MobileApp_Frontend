import { useState,useEffect, useRef} from "react";
import "../../styles/Shop/newProductModal.css";
import { 
  addShopProduct,
  updateShopProduct   // ✅ NEW ADDED
} from "../../services/adminShopProductService";
import { getCategoriesAPI, getSubCategoriesAPI } from "../../services/productService";

export default function NewProductModal({ open, onClose, onDeploy, product, shopId,shopCategory,shopCategoryId }) {

  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [base, setBase] = useState("");
  const [rebate, setRebate] = useState("");
  const [stock, setStock] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("veg");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [openCategory, setOpenCategory] = useState(false);
  const [openSubCategory, setOpenSubCategory] = useState(false);
  const categoryRef = useRef(null);
  const subCategoryRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("");

  useEffect(() => {
    if(!open) return;
    if (product) {
      setName(product.name || "");
      setDesc(product.description ?? product.desc ?? "");
      setBase(product.price || "");
      setRebate(product.final_price || "");
      setStock(product.stock || 0);
      setCategory(product.category || "Food");
      setType(product.food_type === "NON-VEG" ? "nonveg" : "veg");
      setTime(product.preparing_minutes || ""); 

      if (product.image && product.image !== "image.jpg") {
        setPreview(null);
        setPreview(product.image + "?t=" + new Date().getTime());
      } else {
        setPreview("/image.jpg");
      }
    } else {
  setName("");
  setDesc("");
  setBase("");
  setRebate("");
  setStock("");
  setTime("");

  // ⭐ USE shopCategory for ADD MODE


  setSubCategory("");
  setType("veg");
  setPreview(null);
  setErrors({});
}

}, [open, product]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setOpenCategory(false);
      }
      if (subCategoryRef.current && !subCategoryRef.current.contains(e.target)) {
        setOpenSubCategory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ⭐ STEP-2: Force category from shop when modal opens
useEffect(() => {
  if (open && shopCategory && !product) {
    setCategory(shopCategory);
    setSubCategory("");
  }
}, [open, shopCategory, product]);

  
  useEffect(() => {
  const loadSubs = async () => {
    if (!shopCategoryId) return;

    try {
      const subData = await getSubCategoriesAPI(shopCategoryId);
      setSubCategories(subData);
      // 🔥 AFTER loading → set subcategory
      if (product && product.subcategory) {
        setSubCategory(product.subcategory);
      }
    } catch (err) {
      console.error("Subcategory fetch error", err);
    }
  };

  if (open) {
    loadSubs();
  }
}, [shopCategoryId, open, product]);



  useEffect(() => {
    if (category === "Food") {
      setStock("");
    }
  }, [category]);

  if (!open) return null;

  const backendCategoryMap = {
    Food: "Food",
    Grocery: "Grocery",
    Pharmacy: "Pharmacy",
    Electronics: "Electronics",
    Cosmetics: "Cosmetics"
  };

  const isEditMode = !!product;

  const deploy = async () => {
    let newErrors = {};

    if (!name.trim()) newErrors.name = "Product name required";
    if (!desc.trim()) newErrors.desc = "Description required";
    if (!subCategory) newErrors.subCategory = "Select sub-category";
    if (!base) newErrors.base = "Enter MRP";
    if (!rebate) newErrors.rebate = "Enter Selling Price";

    if (category === "Food") {
      if (!time) newErrors.time = "Enter preparation time";
    } else {
      if (!stock) newErrors.stock = "Enter stock quantity";
      if (!weight) newErrors.weight = "Enter weight";

  if (!weightUnit) newErrors.weightUnit = "Select weight unit";

  if (weight && Number(weight) <= 0)
    newErrors.weight = "Weight must be greater than 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const mrp = parseInt(base, 10);
    const sp = parseInt(rebate, 10);

    if (isNaN(mrp) || isNaN(sp)) {
      alert("Enter valid price values");
      return;
    }

    if (sp > mrp) {
      alert("Selling price cannot be greater than MRP");
      return;
    }

    const discount = mrp - sp;

    const formData = new FormData();

formData.append("name", name);
formData.append("description", desc);
formData.append("price", mrp);
formData.append("final_price", sp);
formData.append("discount", discount);
formData.append("stock", stock || 0);
formData.append("weight_value", weight || 0);
formData.append("weight_unit", weightUnit || "");
formData.append("preparing_minutes", time || 0);
formData.append("food_type", type === "veg" ? "VEG" : "NON-VEG");
formData.append("category", backendCategoryMap[category]);
formData.append("subcategory", subCategory || "");
formData.append("is_live", true);

if (imageFile) {
  formData.append("image", imageFile);
}
for (let pair of formData.entries()) {
  console.log(pair[0], pair[1]);
}

    try {

      // ✅ NEW ADDED UPDATE SUPPORT
      if (product) {
        await updateShopProduct(product.id, formData);
      } else {
        await addShopProduct(shopId, formData);
      }

      alert(isEditMode ? "✅ Product Updated Successfully!" : "✅ Product Added Successfully!");
      onDeploy();
      onClose();

    } catch (error) {
      console.error(error);
      alert("❌ Failed to process product");
    }
  };

  const categoryIconMap = {
    Food: "🍔",
    Grocery: "🛒",
    Pharmacy: "💊",
    Electronics: "📱",
    Cosmetics: "💄",
  };

  const selectedSubIcon =
    subCategories.find(s => s.name === subCategory)?.icon;

  const handleCategorySelect = async (cat) => {
    setCategory(cat.name);
    setSubCategory("");

    try {
      const subData = await getSubCategoriesAPI(cat.id);
      setSubCategories(subData);
    } catch (err) {
      console.error("Subcategory fetch error", err);
    }
  };

  return (
    <div className="big-modal-overlay">
      <div className="big-modal-card">

        <div className="big-header">
          <h2>{product ? "Edit Product Details" : "Add New Product"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="big-body">

          {/* LEFT IMAGE */}
          <div className="image-section">
            <h4>PRODUCT IMAGE</h4>

  <div className="image-upload-box">

{preview ? (
  <img key={preview} src={preview} alt="" />
) : (
  <div className="empty-image">Click to add image</div>
)}

  <label className="upload-overlay">
    {product ? "Change Image" : "Click to Add Image"}
    <input
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          setImageFile(file);
setPreview(null); // 🔥 clear old image
setTimeout(() => {
  setPreview(URL.createObjectURL(file));
}, 0);
        }
      }}
    />
  </label>

</div>
</div>

          {/* RIGHT FORM */}
          <div className="form-section">
          <div className="row stock-weight-row">
{/* 🔥 CATEGORY FIELD */}

{!shopCategory ? (

  /* 👉 Show dropdown ONLY if category not fixed */
  <div className="field relative" ref={categoryRef}>
    <h4>PRODUCT CATEGORY *</h4>

    <div
      className="dropdown-btn"
      onClick={() => setOpenCategory(!openCategory)}
    >
      {category ? (
        <span>
          {categoryIconMap[category]} &nbsp;{category}
        </span>
      ) : (
        <span className="placeholder">Select a Category</span>
      )}

      <span className="arrow">▾</span>
    </div>

    {openCategory && (
      <ul className="dropdown-menu dropdown-animate">
        {categories.map((cat) => (
          <li
            key={cat.id}
            onClick={() => {
              handleCategorySelect(cat);
              setOpenCategory(false);
            }}
          >
            {cat.icon || "📦"} &nbsp;{cat.name}
          </li>
        ))}
      </ul>
    )}

    {errors.category && <p className="error">{errors.category}</p>}
  </div>

) : (

  /* 👉 Show fixed category (no dropdown) */
  <div className="field">
    <h4>PRODUCT CATEGORY</h4>

    <div className="dropdown-btn disabled">
      {categoryIconMap[shopCategory]} &nbsp;{shopCategory}
    </div>

  </div>

)}


<div className="field relative" ref={subCategoryRef}>
  <h4>SUB-CATEGORY *</h4>

  <div
    className={`dropdown-btn ${!category ? "disabled" : ""}`}
    onClick={() => {
      if (!category) return;
      setOpenSubCategory((prev) => !prev);
    }}
  >
    {subCategory ? (
  <span>
    {selectedSubIcon} &nbsp;{subCategory}
  </span>
) : (
  <span className="placeholder">Select Sub-Category</span>
)}

    <span className="arrow">▾</span>
  </div>

{openSubCategory && (
  <ul className="dropdown-menu">
    {subCategories.map((sub) => (
  <li
    key={sub.id}
    onClick={() => {
      setSubCategory(sub.name);
      setOpenSubCategory(false);
    }}
  >
    {sub.icon || "📁"} {sub.name}
  </li>
))}

  </ul>
)}


  {errors.subCategory && <p className="error">{errors.subCategory}</p>}
</div>


  
</div>


            <h4>PRODUCT DETAILS *</h4>
   <div className="input-group">
  <input
    placeholder="Product Name (e.g.Dum Biryani)"
    value={name}
    onChange={(e) => setName(e.target.value)}
    className={errors.name ? "has-error" : ""}
  />
  {errors.name && <span className="error-text">{errors.name}</span>}
</div>



            <textarea
              placeholder="Product Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            {errors.desc && <p className="error">{errors.desc}</p>}


            <h4>PRICING DETAILS *</h4>
            <div className="row">
  <div className="field">
    <input
      placeholder="MRP ₹"
      value={base}
      onChange={(e)=>setBase(e.target.value)}
    />
    {errors.base && <p className="error">{errors.base}</p>}
  </div>

  <div className="field">
    <input
      placeholder="Selling Price ₹"
      value={rebate}
      onChange={(e)=>setRebate(e.target.value)}
    />
    {errors.rebate && <p className="error">{errors.rebate}</p>}
  </div>
</div>

            {/* 🔥 DYNAMIC BOTTOM SECTION */}
{category === "Food" ? (
  <>
    <h4>PREPARATION DETAILS *</h4>
    <div className="row two-col">
      <div className="field">
         <div className="input-group">
        <label>Preparation Time (MIN)</label>
        <input
          className="food-input"
          placeholder="Enter preparation time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        {errors.time && <p className="error">{errors.time}</p>}
</div>
      </div>

      <div className="field">
        <label>Food Type</label>
        <div className="toggle">
          <button
            type="button"
            className={type==="veg" ? "active":""}
            onClick={()=>setType("veg")}
          >
            VEG
          </button>
          <button
            type="button"
            className={type==="nonveg" ? "active":""}
            onClick={()=>setType("nonveg")}
          >
            NON-VEG
          </button>
        </div>
      </div>
    </div>
  </>
) : (
  <>
  <h4>STOCK & WEIGHT *</h4>
 <div className="row two-col">

  {/* STOCK */}
  <div className="field">
    <input
      type="number"
      placeholder="Available stock"
      value={stock}
      onChange={(e) => setStock(e.target.value)}
    />
    {errors.stock && <p className="error">{errors.stock}</p>}
  </div>

  {/* WEIGHT COMBINED */}
  <div className="field">
  <div className="weight-field">

  <input
    type="number"
    placeholder="Enter weight"
    value={weight}
    onChange={(e)=>setWeight(e.target.value)}
  />

  <select
    value={weightUnit}
    onChange={(e)=>setWeightUnit(e.target.value)}
  >
    <option value="" disabled hidden>
    Select Unit
  </option>
    <option value="g">Gram</option>
    <option value="kg">Kg</option>
  </select>

</div>
{(errors.weight || errors.weightUnit) && (
    <p className="error">
      {errors.weight || errors.weightUnit}
    </p>
  )}
</div>
</div>

</>
)}
          </div>
        </div>

        <div className="big-footer">
          <button className="cancel" onClick={onClose}>Cancel</button>
          <button className="deploy" onClick={deploy}>
  {product ? "Update Product" : "Save Product"}
</button>

        </div>

      </div>
    </div>
  );
}