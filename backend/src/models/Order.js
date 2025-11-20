import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number
      }
    ],

    totalPrice: Number,
    shippingFee: Number,

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "shipping", "completed", "cancelled"]
    },

    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

    paymentMethod: String,
    transactionId: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
