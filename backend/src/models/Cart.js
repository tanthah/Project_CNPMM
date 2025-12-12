import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1 },
        price: Number,           // giá gốc
        finalPrice: Number,      // giá sau giảm
        productName: String,
        productImage: String,

        attributes: {
          type: Object,
          default: {}
        }
      }
    ],

    totalQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
