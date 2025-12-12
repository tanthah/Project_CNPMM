import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    fullName: String,
    phone: String,

    addressLine: String,
    ward: String,
    district: String,
    city: String,

    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Address", addressSchema);
