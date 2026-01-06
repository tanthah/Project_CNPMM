import mongoose from "mongoose";
import "./Category.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,

    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalPrice: Number,

    stock: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    // NÂNG CAO: Thống kê Đánh giá & Xếp hạng
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },

    // Chi tiết xếp hạng
    ratingBreakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },

    // MỚI: Thống kê tương tác khách hàng
    wishlistCount: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    images: [String],
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,
    attributes: { type: Object, default: {} },
    isActive: { type: Boolean, default: true },
    promotionText: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual: Sản phẩm tương tự (cùng danh mục)
productSchema.virtual('similarProducts', {
  ref: 'Product',
  localField: 'categoryId',
  foreignField: 'categoryId',
  match: function () {
    return {
      _id: { $ne: this._id },
      isActive: true
    };
  },
  options: { limit: 8, sort: { sold: -1 } }
});

// Tự động tính giá cuối cùng
productSchema.pre("save", function (next) {
  this.finalPrice = this.price - (this.price * this.discount) / 100;
  next();
});

// Phương thức: Cập nhật xếp hạng từ đánh giá
productSchema.methods.updateRatingFromReviews = async function () {
  const Review = mongoose.model('Review');

  const stats = await Review.aggregate([
    {
      $match: {
        productId: this._id,
        isHidden: false
      }
    },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length > 0) {
    const { avgRating, totalReviews, rating1, rating2, rating3, rating4, rating5 } = stats[0];

    this.rating = Math.round(avgRating * 10) / 10;
    this.numReviews = totalReviews;
    this.ratingBreakdown = {
      1: rating1,
      2: rating2,
      3: rating3,
      4: rating4,
      5: rating5
    };
  } else {
    this.rating = 0;
    this.numReviews = 0;
    this.ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }

  await this.save();
};

// Phương thức: Tăng số lượt yêu thích
productSchema.methods.incrementWishlistCount = function () {
  this.wishlistCount += 1;
  return this.save();
};

// Phương thức: Giảm số lượt yêu thích
productSchema.methods.decrementWishlistCount = function () {
  if (this.wishlistCount > 0) {
    this.wishlistCount -= 1;
    return this.save();
  }
};

export default mongoose.model("Product", productSchema);