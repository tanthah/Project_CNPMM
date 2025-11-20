import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    method: String,
    amount: Number,
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },
    transactionTime: Date
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
