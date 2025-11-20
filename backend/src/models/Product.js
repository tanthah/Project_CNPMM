import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    //không cần id vì mongodb tự tạo
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: Number,

    stock: { type: Number, default: 0 },

    images: [String],

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

    brand: String,

  },
  { timestamps: true }
);

// auto tính finalPrice
productSchema.pre("save", function (next) {
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  next();
});

export default mongoose.model("Product", productSchema);
