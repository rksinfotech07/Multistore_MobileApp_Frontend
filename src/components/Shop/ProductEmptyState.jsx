import { Plus, Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
// ✅ CORRECT
import emptyBoxImg from "../../assets/empty-box.png";

const ProductEmptyState = ({ onAdd }) => {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="flex flex-col items-center text-center max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Image */}
        <motion.img
          src={emptyBoxImg}
          alt="Empty"
          className="w-40 h-40 mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        />

        {/* Title */}
        <h2 className="text-xl font-semibold">
          No Products Found
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 mt-2">
          You haven't added any products yet.
        </p>
      </motion.div>
    </div>
  );
};

export default ProductEmptyState;