// backend/src/models/Order.js - ENHANCED WITH DETAILED STATUSES
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

    // ✅ ENHANCED STATUS SYSTEM
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

    // ✅ STATUS HISTORY - Track all status changes
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

    notes: String,
    cancelReason: String,

    // ✅ TIMESTAMPS FOR STATUS TRACKING
    confirmedAt: Date,        // Thời điểm xác nhận
    preparingAt: Date,        // Thời điểm bắt đầu chuẩn bị
    shippingAt: Date,         // Thời điểm bắt đầu giao
    completedAt: Date,        // Thời điểm hoàn thành
    cancelledAt: Date,        // Thời điểm hủy
    cancelRequestedAt: Date,  // Thời điểm yêu cầu hủy

    // ✅ SHIPPING INFO
    shippingInfo: {
      shippedAt: Date,
      deliveredAt: Date,
      trackingNumber: String,
      carrier: String,
      estimatedDelivery: Date
    },

    // ✅ CANCELLATION INFO
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

// ✅ VIRTUAL: Check if order can be cancelled
orderSchema.virtual('canDirectCancel').get(function() {
  if (this.status === 'cancelled' || this.status === 'completed') {
    return false;
  }
  
  // Allow direct cancel only for 'new' and 'confirmed' status
  if (this.status === 'new' || this.status === 'confirmed') {
    const now = new Date();
    const orderTime = this.createdAt;
    const timeDiff = (now - orderTime) / 1000 / 60; // minutes
    return timeDiff <= 30;
  }
  
  return false;
});

// ✅ VIRTUAL: Check if can request cancellation
orderSchema.virtual('canRequestCancel').get(function() {
  return this.status === 'preparing' && this.status !== 'cancel_requested';
});

// ✅ PRE-SAVE: Set cancel deadline
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    // Set cancel deadline to 30 minutes after creation
    this.cancellationInfo.cancelDeadline = new Date(this.createdAt.getTime() + 30 * 60 * 1000);
    
    // Add initial status to history
    this.statusHistory.push({
      status: 'new',
      timestamp: new Date(),
      note: 'Đơn hàng được tạo',
      updatedBy: 'system'
    });
  }
  next();
});

// ✅ METHOD: Update status with history
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy = 'system') {
  this.status = newStatus;
  
  // Update corresponding timestamp
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
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note: note || `Chuyển sang trạng thái ${newStatus}`,
    updatedBy
  });
  
  return this.save();
};

// ✅ STATIC: Auto-confirm orders after 30 minutes
orderSchema.statics.autoConfirmOrders = async function() {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  
  const orders = await this.find({
    status: 'new',
    createdAt: { $lte: thirtyMinutesAgo }
  });
  
  for (const order of orders) {
    await order.updateStatus('confirmed', 'Tự động xác nhận sau 30 phút', 'system');
    console.log(`✅ Auto-confirmed order: ${order.orderCode}`);
  }
  
  return orders.length;
};

export default mongoose.model("Order", orderSchema);