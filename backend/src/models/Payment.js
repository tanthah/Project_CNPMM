import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    method: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO", "PAYPAL", "STRIPE"],
      required: true
    },

    amount: { type: Number, required: true },
    currency: { type: String, default: "VND" },

    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending"
    },

    // Mã giao dịch trả về từ cổng thanh toán
    transactionId: String,

    // Dữ liệu trả về đã đổi soát
    providerResponse: Object,

    description: String,

    transactionTime: Date
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
