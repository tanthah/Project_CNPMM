import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, unique: true },
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

    // Thông tin mã giảm giá
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },

    //  THÔNG TIN ĐIỂM THƯỞNG
    usedPoints: { type: Number, default: 0 },   // Điểm đã dùng
    earnedPoints: { type: Number, default: 0 }, // Điểm tích được

    //  HỆ THỐNG TRẠNG THÁI NÂNG CAO
    status: {
      type: String,
      default: "new",
      enum: [
        "new",              // 1. Đơn hàng mới
        "confirmed",        // 2. Đã xác nhận
        "preparing",        // 3. Đang chuẩn bị hàng
        "shipping",         // 4. Đang giao hàng
        "completed",        // 5. Đã giao thành công
        "cancelled",        // 6. Đã hủy
        "cancel_requested"  // Yêu cầu hủy (khi đang chuẩn bị)
      ]
    },

    // LỊCH SỬ TRẠNG THÁI - Theo dõi tất cả thay đổi trạng thái
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: String // 'system', 'customer', 'admin'
      }
    ],

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid"
    },

    paymentMethod: String,
    transactionId: String,
    addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },

    //  GHI CHÚ
    notes: String, // Ghi chú của khách hàng
    internalNote: String, // Ghi chú nội bộ của Admin
    cancelReason: String,

    //  MỐC THỜI GIAN THEO DÕI TRẠNG THÁI
    confirmedAt: Date,        // Thời điểm xác nhận
    preparingAt: Date,        // Thời điểm bắt đầu chuẩn bị
    shippingAt: Date,         // Thời điểm bắt đầu giao
    completedAt: Date,        // Thời điểm hoàn thành
    cancelledAt: Date,        // Thời điểm hủy
    cancelRequestedAt: Date,  // Thời điểm yêu cầu hủy

    //  THÔNG TIN GIAO HÀNG
    shippingInfo: {
      shippedAt: Date,
      deliveredAt: Date,
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date
    },

    //  THÔNG TIN HỦY ĐƠN
    cancellationInfo: {
      canCancel: { type: Boolean, default: true },
      cancelDeadline: Date,  // 30 phút sau khi đặt
      requestedBy: String,
      approvedBy: String,
      rejectionReason: String
    },

    isReviewed: { type: Boolean, default: false }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//  VIRTUAL: Kiểm tra xem đơn hàng có thể hủy không
orderSchema.virtual('canDirectCancel').get(function () {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return false;
  }

  // Chỉ cho phép hủy trực tiếp cho trạng thái 'new' và 'confirmed'
  if (this.status === 'new' || this.status === 'confirmed') {
    const now = new Date();
    const orderTime = this.createdAt;
    const timeDiff = (now - orderTime) / 1000 / 60; // minutes
    return timeDiff <= 30;
  }

  return false;
});

//  VIRTUAL: Kiểm tra xem có thể yêu cầu hủy không
orderSchema.virtual('canRequestCancel').get(function () {
  return this.status === 'preparing' && this.status !== 'cancel_requested';
});

// PRE-SAVE: Đặt thời hạn hủy
orderSchema.pre('save', function (next) {
  if (this.isNew) {
    // Đặt thời hạn hủy là 30 phút sau khi tạo
    this.cancellationInfo.cancelDeadline = new Date(this.createdAt.getTime() + 30 * 60 * 1000);

    // Thêm trạng thái ban đầu vào lịch sử
    this.statusHistory.push({
      status: 'new',
      timestamp: new Date(),
      note: 'Đơn hàng được tạo',
      updatedBy: 'system'
    });
  }
  next();
});

// METHOD: Cập nhật trạng thái kèm lịch sử
orderSchema.methods.updateStatus = function (newStatus, note, updatedBy = 'system') {
  this.status = newStatus;

  // Cập nhật mốc thời gian tương ứng
  const timestampMap = {
    'confirmed': 'confirmedAt',
    'preparing': 'preparingAt',
    'shipping': 'shippingAt',
    'completed': 'completedAt',
    'cancelled': 'cancelledAt',
    'cancel_requested': 'cancelRequestedAt'
  };

  if (timestampMap[newStatus]) {
    this[timestampMap[newStatus]] = new Date();
  }

  // Thêm vào lịch sử trạng thái
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Chuyển sang trạng thái ${newStatus}`,
    updatedBy
  });

  return this.save();
};

// STATIC: Tự động xác nhận đơn hàng sau 30 phút
orderSchema.statics.autoConfirmOrders = async function () {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const orders = await this.find({
    status: 'new',
    createdAt: { $lte: thirtyMinutesAgo }
  });

  for (const order of orders) {
    await order.updateStatus('confirmed', 'Tự động xác nhận sau 30 phút', 'system');
    console.log(` Auto-confirmed order: ${order.orderCode}`);
  }

  return orders.length;
};

export default mongoose.model("Order", orderSchema);