import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { useState,useEffect, useRef} from "react";
import "../../styles/Shop/newProductModal.css";
import toast from "react-hot-toast";
import { Loader2, Check } from "lucide-react";
import { 
  addShopProduct,
  updateShopProduct   // ✅ NEW ADDED
} from "../../services/adminShopProductService";
import { getCategoriesAPI, getSubCategoriesAPI } from "../../services/productService";
import { getProductTypesAPI } from "../../services/productService";

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
  const [subCategoryId, setSubCategoryId] = useState("");
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
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [productTypes, setProductTypes] = useState([]);
  const [productType, setProductType] = useState("");
  const [openProductType, setOpenProductType] = useState(false);
const productTypeRef = useRef(null);
const [showCrop, setShowCrop] = useState(false);
const [selectedImage, setSelectedImage] = useState(null);
const imgRef = useRef(null);
const [crop, setCrop] = useState({
  unit: "%",
  width: 50,
  height: 50,
  x: 25,
  y: 25
});


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
      setProductType(product.product_type_id || "");
      setWeight(product.weight_value || "");
      setWeightUnit(product.weight_unit || "");

      if (product.image && product.image !== "image.jpg") {
        setImgLoading(true);
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
 setSubCategory("");
 setSubCategoryId("");
 
setType("veg");
 setPreview(null);
  setErrors({});
  setProductType("");  
setProductTypes([]);  
setOpenProductType(false); 
setWeight("");        
setWeightUnit("");   
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
  const matched = subData.find(
    (s) => s.name === product.subcategory
  );

  if (matched) {
    setSubCategory(matched.name);
    setSubCategoryId(matched.id);   // 🔥 MUST ADD THIS
  }
}
}
    catch (err) {
      console.error("Subcategory fetch error", err);
    }
  };

  if (open) {
    loadSubs();
  }
}, [shopCategoryId, open, product]);
useEffect(() => {
  const loadProductTypes = async () => {
    if (
      (category?.toLowerCase() === "grocery" || category?.toLowerCase() === "electronics") &&
      subCategoryId   
    ) {
      try {
        const data = await getProductTypesAPI(subCategoryId);
        setProductTypes(data);
      } catch (err) {
        console.error("Product type fetch error", err);
      }
    } else {
      setProductTypes([]);
    }
  };

  if (open) {
    loadProductTypes();
  }
}, [category, subCategoryId, open]);

useEffect(() => {
  if (product && productTypes.length > 0) {
    setProductType(product.product_type_id || "");
  }
}, [productTypes]);

  useEffect(() => {
    if (category?.toLowerCase() === "food") {
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

   if (category?.toLowerCase() === "food") {
  if (!time) {
    newErrors.time = "Enter preparation time";
  }

    if (!weight) newErrors.weight = "Enter quantity";
    if (!weightUnit) newErrors.weightUnit = "Select unit";
} else {
      if (!stock) newErrors.stock = "Enter stock quantity";
      if (!weight) newErrors.weight = "Enter weight";

  if (!weightUnit) newErrors.weightUnit = "Select weight unit";

  if (weight && Number(weight) <= 0)
    newErrors.weight = "Weight must be greater than 0";
    // 🔥 ADD THIS BLOCK
  if (category === "Grocery" || category === "Electronics") {
    if (!productType) {
      newErrors.productType = "Select product type";
    }
  }
    }

    if (Object.keys(newErrors).length > 0) {
      console.log("ERRORS:", newErrors);
      setErrors(newErrors);
      return;
    }

    setErrors({});

    const mrp = parseInt(base, 10);
    const sp = parseInt(rebate, 10);

    if (isNaN(mrp) || isNaN(sp)) {
     toast.error("Enter valid price values");
      return;
    }

    if (sp > mrp) {
      toast.error("Selling price cannot be greater than MRP");
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
let finalUnit = weightUnit;
// convert pcs → unit
if (weightUnit === "pcs") {
  finalUnit = "unit";
}
formData.append("weight_unit", finalUnit);
formData.append("preparing_minutes", time || 0);
formData.append("food_type", type === "veg" ? "VEG" : "NON-VEG");
formData.append("category", backendCategoryMap[category]);
formData.append("subcategory", subCategory || "");
formData.append("is_live", true);
const selectedType = productTypes.find(
  (pt) => pt.id == productType
);

formData.append("product_type", selectedType?.name || "");

// 🔥 NEW PRODUCT → image MUST
if (!product && !imageFile) {
  toast.error("Please upload and crop image");
  return;
}

// 🔥 IMAGE IRUNDHA MATUM SEND
if (imageFile instanceof File) {
  formData.append("image", imageFile);
}

try {
  const start = Date.now(); // 🔥 track time

  setLoading(true);

  if (product) {
    await updateShopProduct(product.id, formData);
  } else {
    await addShopProduct(shopId, formData);
  }
  

  const elapsed = Date.now() - start;

  // 🔥 minimum loader 600ms
  if (elapsed < 600) {
    await new Promise(r => setTimeout(r, 600 - elapsed));
  }

  setLoading(false); // ✅ now smooth

  onDeploy(); // refresh table

  setTimeout(() => {
    onClose(); // smooth close
  }, 200);

  toast.success(
    isEditMode 
      ? "Product Updated Successfully!" 
      : "Product Added Successfully!"
  );

} catch (error) {
  console.error(error);
  setLoading(false);
  toast.error("Failed to process product");
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
  setSubCategoryId(""); // ✅ ADD THIS LINE

  try {
    const subData = await getSubCategoriesAPI(cat.id);
    setSubCategories(subData);
  } catch (err) {
    console.error("Subcategory fetch error", err);
  }
};

const handleCrop = async () => {
   const image = imgRef.current; 

 
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = crop.x * scaleX;
    const cropY = crop.y * scaleY;
  // 🔥 FORCE SQUARE

    const OUTPUT_SIZE = 220;

    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      crop.width * scaleX,    // ✅ changed
  crop.height * scaleY,   // ✅ changed
      0,
      0,
      OUTPUT_SIZE,
      OUTPUT_SIZE
    );

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "cropped.jpg", {
        type: "image/jpeg",
      });

      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setShowCrop(false);
    }, "image/jpeg");
  };

  return (
    <div className="big-modal-overlay">
     <div className="big-modal-card">

 {loading && (
  <div className="loader-overlay">
    <div className="loader-box">
      <Loader2 className="spin" size={36} />
      <p className="loader-text">
  {isEditMode ? "Updating product..." : "Adding product..."}
</p>
    </div>
  </div>
)}
        
  

        <div className="big-header">
          <h2>{product ? "Edit Product Details" : "Add New Product"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="big-body">

          {/* LEFT IMAGE */}
          <div className="image-section">
            <h4>PRODUCT IMAGE</h4>

  <div className="image-upload-box">
    {/* 🔥 IMAGE LOADER */}
{imgLoading && (
  <div className="image-loader">
    <Loader2 className="spin" size={40} />
  </div>
)}
{preview ? (
  <img
    key={preview}
    src={preview}
    alt=""
    onLoad={() => setImgLoading(false)}   // ✅ stop loader
    onError={() => setImgLoading(false)}  // safety
  />
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
    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);   // 🔥 NEW
    setShowCrop(true);            // 🔥 NEW (open crop modal)
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
  <span className="placeholder">Choose Sub-Category</span>
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
      setSubCategoryId(sub.id); 
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
{/*  PRODUCT TYPE (ONLY FOR ELECTRONICS & GROCERY) */}
{(category?.toLowerCase() === "grocery" || category?.toLowerCase() === "electronics") && (
  <div className="field">
    <h4>PRODUCT TYPE *</h4>

    <select
    className="product-type-select"
  value={productType}
  onMouseDown={(e) => {
    if (!subCategoryId) {
      e.preventDefault(); // 🚫 stop dropdown

      setErrors((prev) => ({
        ...prev,
        productType: "Select sub-category first"
      }));
    }
  }}
  onChange={(e) => {
    if (!subCategoryId) return;

    setProductType(e.target.value);

    setErrors((prev) => ({
      ...prev,
      productType: ""
    }));
  }}
>
      <option value="" disabled hidden>Select Type</option>
      {productTypes.map((pt) => (
  <option key={pt.id} value={pt.id}>
    {pt.name}
  </option>
))}
    </select>

    {errors.productType && (
      <p className="error">{errors.productType}</p>
    )}
  </div>
)}


  
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
  key={product?.id}
  placeholder="Product Description"
  value={desc || ""}
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
{category?.toLowerCase() === "food" ? (
  <>
    <h4>PREPARATION DETAILS *</h4>

    <div className="row three-col">

      {/* PREP TIME */}
      <div className="field">
        <label>Preparation Time (MIN)</label>
        <input
          className="food-input"
          placeholder="Enter preparation time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        {errors.time && <p className="error">{errors.time}</p>}
      </div>

      {/* FOOD TYPE */}
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

      {/* 🔥 QUANTITY INLINE */}
      <div className="field">
  <label>Quantity *</label>

  <div className="weight-field quantity-field">
    <input
      type="number"
      placeholder="Quantity"
      value={weight}
      onChange={(e)=>setWeight(e.target.value)}
    />

    <select
      value={weightUnit}
      onChange={(e)=>setWeightUnit(e.target.value)}
    >
      <option value="" disabled hidden>Unit</option>

      {(subCategory === "Juice" || subCategory === "Shake") ? (
        <>
          <option value="ml">ML</option>
          <option value="l">Litre</option>
        </>
      ) : (
        <>
          <option value="unit">Pieces</option>
          <option value="g">Gram</option>
          <option value="kg">Kg</option>
        </>
      )}
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

  {category === "Food" && 
   (subCategory === "Juice" || subCategory === "Shake") ? (
    <>
      <option value="ml">ML</option>
      <option value="l">Litre</option>
    </>
  ) : (
    <>
      <option value="g">Gram</option>
      <option value="kg">Kg</option>
    </>
  )}
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
          <button 
  className="deploy" 
  onClick={deploy}
  disabled={loading}
>
  {loading 
    ? "Processing..." 
    : (product ? "Update Product" : "Save Product")}
</button>

        </div>
        {showCrop && (
  <div className="crop-overlay">
    <div className="crop-card">

  {/* HEADER */}
  <div className="crop-header">
    <div className="crop-title">
      <div>
        <h3>Crop Image</h3>
      </div>
    </div>

    <button className="crop-close" onClick={() => setShowCrop(false)}>✕</button>
  </div>

  {/* IMAGE */}
  <div className="crop-area">
  <ReactCrop
  crop={crop}
  onChange={(c) => setCrop(c)}
  onComplete={(c) => setCrop(c)}   // ✅ IMPORTANT FIX
  aspect={1}
>
  <img
    ref={imgRef}                   // ✅ ADD THIS
    src={selectedImage}
    alt="crop"
    crossOrigin="anonymous"
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }}
  />
</ReactCrop>
</div>


  {/* ACTIONS */}
  <div className="crop-actions">

    <button className="save-btn" onClick={handleCrop}>
      <Check size={16} /> Save
    </button>
  </div>

</div>
  </div>
)}

      </div>
    </div>
  )
};
