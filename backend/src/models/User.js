import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: String,
    avatar: { type: String, default: "" },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"], default: "other" },
    role: { type: String, enum: ["admin", "user"], default: "user" },  // admin, user

    isActive: { type: Boolean, default: true },

    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,

    // Dự phòng cho email verification trong tương lai
    // verificationOtp: String,
    // verificationOtpExpires: Date,
    // emailVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);