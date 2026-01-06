
import mongoose from "mongoose";
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },

    type: {
      type: String,
      enum: ['fixed', 'percentage'], // Giảm cố định hoặc phần trăm
      required: true
    },

    value: {
      type: Number,
      required: true
    },

    minOrderValue: {
      type: Number,
      default: 0
    },

    maxDiscount: {
      type: Number // Giảm tối đa (cho loại percentage)
    },

    // Giới hạn sử dụng
    maxUses: {
      type: Number // null = không giới hạn
    },

    usedCount: {
      type: Number,
      default: 0
    },

    // Coupon dành riêng cho user (từ review)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // Thời gian hiệu lực
    startDate: {
      type: Date,
      default: Date.now
    },

    expiryDate: {
      type: Date,
      required: true
    },

    // Trạng thái
    isActive: {
      type: Boolean,
      default: true
    },

    // Nguồn tạo coupon
    source: {
      type: String,
      enum: ['review', 'admin', 'promotion', 'registration'],
      default: 'admin'
    },

    sourceId: mongoose.Schema.Types.ObjectId, // Review ID or Promotion ID

    description: String
  },
  { timestamps: true }
);

// Phương thức: Kiểm tra xem coupon có hợp lệ không
couponSchema.methods.isValid = function (orderValue) {
  const now = new Date();

  if (!this.isActive) return { valid: false, message: 'Mã giảm giá không còn hiệu lực' };
  if (now < this.startDate) return { valid: false, message: 'Mã giảm giá chưa có hiệu lực' };
  if (now > this.expiryDate) return { valid: false, message: 'Mã giảm giá đã hết hạn' };
  if (this.maxUses && this.usedCount >= this.maxUses) return { valid: false, message: 'Mã giảm giá đã hết lượt sử dụng' };
  if (orderValue < this.minOrderValue) return { valid: false, message: `Đơn hàng tối thiểu ${this.minOrderValue.toLocaleString('vi-VN')}đ` };

  return { valid: true };
};

// Phương thức: Tính toán giảm giá
couponSchema.methods.calculateDiscount = function (orderValue) {
  if (this.type === 'fixed') {
    return Math.min(this.value, orderValue);
  } else {
    const discount = (orderValue * this.value) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  }
};

export const Coupon = mongoose.model("Coupon", couponSchema);