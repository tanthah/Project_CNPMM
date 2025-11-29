import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Không cần id vì mongodb tự tạo
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: Number,

    stock: { type: Number, default: 0 },           // tồn kho
    sold: { type: Number, default: 0 },            // đã bán
    views: { type: Number, default: 0 },           // lượt xem

    images: [String],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,

    attributes: { type: Object, default: {} },

    isActive: { type: Boolean, default: true },                    // ẩn/hiện sản phẩm
    promotionText: String                                          // text giảm giá gần nhất "flash sale", "mới", "hot"
  },
  { timestamps: true }
);

// Auto tính finalPrice
productSchema.pre("save", function (next) {
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  next();
});

export default mongoose.model("Product", productSchema);
