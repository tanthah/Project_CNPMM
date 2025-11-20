import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    //không cần id vì mongodb tự tạo
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
