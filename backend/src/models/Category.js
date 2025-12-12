import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    // Không cần id vì mongodb tự tạo
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    description: String,
    image: String,                                    // ảnh danh mục
    isActive: { type: Boolean, default: true }       // ẩn/hiện danh mục
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
