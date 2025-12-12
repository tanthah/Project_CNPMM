// backend/src/models/Review.js - ENHANCED
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    orderId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },

    rating: {
      type: Number,
      min: [1, "Rating tối thiểu là 1"],
      max: [5, "Rating tối đa là 5"],
      required: [true, "Vui lòng chọn đánh giá"]
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment tối đa 1000 ký tự"]
    },

    images: [{
      type: String  // URL ảnh review
    }],

    // Phản hồi từ shop
    reply: {
      content: String,
      repliedAt: Date,
      repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },

    // Trạng thái
    isVerifiedPurchase: { 
      type: Boolean, 
      default: true 
    },
    
    // Helpful votes
    helpfulCount: { 
      type: Number, 
      default: 0 
    },
    
    // Hidden by admin
    isHidden: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Index để tránh duplicate review
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 }, { unique: true });

// Index để query nhanh
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

// Method: Check if user can review this product
reviewSchema.statics.canUserReview = async function(userId, productId, orderId) {
  const existingReview = await this.findOne({ userId, productId, orderId });
  return !existingReview;
};

export default mongoose.model("Review", reviewSchema);