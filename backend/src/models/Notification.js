import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                'order_confirmed',    // Đơn hàng được xác nhận
                'order_shipping',     // Đơn hàng đang giao
                'order_completed',    // Đơn hàng hoàn thành
                'coupon_received',    // Nhận coupon từ review
                'comment_reply',      // Shop trả lời bình luận
                'loyalty_points',     // Tích điểm thưởng
                'order_cancelled'     // Đơn hàng bị hủy
            ],
            required: true
        },

        title: {
            type: String,
            required: true
        },

        message: {
            type: String,
            required: true
        },

        link: {
            type: String,  // URL để redirect khi click
            default: ''
        },

        // Reference đến object liên quan
        referenceId: mongoose.Schema.Types.ObjectId,
        referenceType: {
            type: String,
            enum: ['Order', 'Review', 'Comment', 'Coupon', 'LoyaltyPoint']
        },

        isRead: {
            type: Boolean,
            default: false
        },

        // Metadata bổ sung (optional)
        metadata: {
            type: Object,
            default: {}
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes để query nhanh
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });

// Virtual: Time ago
notificationSchema.virtual('timeAgo').get(function () {
    const now = new Date();
    const diff = now - this.createdAt;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return this.createdAt.toLocaleDateString('vi-VN');
});

export default mongoose.model("Notification", notificationSchema);
