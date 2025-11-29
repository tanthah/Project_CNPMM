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
    discount: { type: Number, default: 0 },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "shipping", "completed", "cancelled"]
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },

    paymentMethod: String,
    transactionId: String,                  // (property) ref: string

    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

    notes: String,

    shippingInfo: {
      shippedAt: Date,
      deliveredAt: Date,
      trackingNumber: String,
      carrier: String
    },

    cancelReason: String,

    isReviewed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
