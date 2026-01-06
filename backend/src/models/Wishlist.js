import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    products: [{
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Phương thức: Thêm sản phẩm vào danh sách yêu thích
wishlistSchema.methods.addProduct = function (productId) {
  const exists = this.products.some(
    p => p.productId.toString() === productId.toString()
  );

  if (exists) {
    throw new Error('Sản phẩm đã có trong danh sách yêu thích');
  }

  this.products.push({ productId });
  return this.save();
};

// Phương thức: Xóa sản phẩm khỏi danh sách yêu thích
wishlistSchema.methods.removeProduct = function (productId) {
  this.products = this.products.filter(
    p => p.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Phương thức: Kiểm tra xem sản phẩm có trong danh sách yêu thích không
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    p => p.productId.toString() === productId.toString()
  );
};

export default mongoose.model("Wishlist", wishlistSchema);

