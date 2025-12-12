// backend/src/controllers/reviewController.js
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { Coupon } from '../models/Coupon.js';
import PendingReview from '../models/PendingReview.js';

// ✅ CREATE REVIEW (Only for completed orders)
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, comment, images } = req.body;

    // Validate inputs
    if (!productId || !orderId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin bắt buộc' 
      });
    }

    // Check if order exists and is completed
    const order = await Order.findOne({ 
      _id: orderId, 
      userId,
      status: 'completed'
    });

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đơn hàng hoặc đơn hàng chưa hoàn thành' 
      });
    }

    // Check if product is in order
    const orderItem = order.items.find(
      item => item.productId.toString() === productId
    );

    if (!orderItem) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sản phẩm không có trong đơn hàng này' 
      });
    }

    // Check if user already reviewed this product for this order
    const canReview = await Review.canUserReview(userId, productId, orderId);
    
    if (!canReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bạn đã đánh giá sản phẩm này rồi' 
      });
    }

    // Create review
    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment: comment || '',
      images: images || []
    });

    await review.populate(['userId', 'productId']);

    // Update product rating
    const product = await Product.findById(productId);
    await product.updateRatingFromReviews();

    // ✅ REWARD: Give loyalty points
    let loyaltyPoints = await LoyaltyPoint.findOne({ userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoint.create({ userId });
    }

    const pointsEarned = 50; // 50 điểm cho mỗi review
    await loyaltyPoints.addPoints(
      pointsEarned,
      `Đánh giá sản phẩm: ${product.name}`,
      review._id,
      'review'
    );

    // ✅ REWARD: Generate coupon
    const couponCode = `REVIEW${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const couponExpiry = new Date();
    couponExpiry.setDate(couponExpiry.getDate() + 30); // Valid for 30 days

    const coupon = await Coupon.create({
      code: couponCode,
      type: 'percentage',
      value: 5, // 5% discount
      minOrderValue: 100000, // Đơn tối thiểu 100k
      maxDiscount: 50000, // Giảm tối đa 50k
      maxUses: 1,
      userId,
      expiryDate: couponExpiry,
      source: 'review',
      sourceId: review._id,
      description: `Mã giảm giá 5% từ đánh giá sản phẩm`
    });

    res.status(201).json({ 
      success: true, 
      review,
      rewards: {
        points: pointsEarned,
        coupon: {
          code: coupon.code,
          discount: `${coupon.value}%`,
          maxDiscount: coupon.maxDiscount,
          expiryDate: coupon.expiryDate
        }
      },
      message: 'Đánh giá thành công! Bạn nhận được 50 điểm và mã giảm giá 5%' 
    });

    // Mark pending review as done
    try {
      await PendingReview.updateOne(
        { userId, productId, orderId },
        { $set: { status: 'done' } }
      );
    } catch (e) {
      console.warn('PendingReview update warn:', e?.message);
    }
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET PENDING REVIEWS (Products from completed orders that haven't been reviewed)
export const getPendingReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // Prefer explicit pending review tasks if available
    const tasks = await PendingReview.find({ userId, status: 'pending', orderId: { $exists: true, $ne: null } })
      .populate('productId', 'name images')
      .populate('orderId', 'orderCode completedAt')
      .sort({ createdAt: -1 });

    let pendingReviews = [];
    if (tasks.length > 0) {
      pendingReviews = tasks.map(t => ({
        orderId: t.orderId?._id || t.orderId,
        orderCode: t.orderId?.orderCode,
        completedAt: t.orderId?.completedAt,
        product: {
          _id: t.productId?._id || t.productId,
          name: t.productId?.name || 'Sản phẩm',
          images: t.productId?.images || [],
          price: 0,
          quantity: 1
        }
      }));
    } else {
      // Fallback: derive from completed orders if tasks not present
      const completedOrders = await Order.find({ 
        userId, 
        status: 'completed' 
      }).populate('items.productId');
      const reviews = await Review.find({ userId }).select('productId orderId');
      const reviewedSet = new Set(reviews.map(r => `${r.productId}-${r.orderId}`));
      for (const order of completedOrders) {
        if (!order?.items?.length) continue;
        for (const item of order.items) {
          if (!item?.productId) continue;
          const pid = item.productId?._id?.toString?.() || item.productId.toString?.() || String(item.productId);
          const key = `${pid}-${order._id}`;
          if (!reviewedSet.has(key)) {
            pendingReviews.push({
              orderId: order._id,
              orderCode: order.orderCode,
              completedAt: order.completedAt,
              product: {
                _id: item.productId?._id || item.productId,
                name: item.productId?.name || 'Sản phẩm',
                images: item.productId?.images || [],
                price: item.price,
                quantity: item.quantity
              }
            });
          }
        }
      }
    }

    res.json({ 
      success: true, 
      pendingReviews,
      count: pendingReviews.length
    });
  } catch (err) {
    console.error('Get pending reviews error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET USER REVIEWS
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments({ userId });
    
    const reviews = await Review.find({ userId })
      .populate('productId', 'name images')
      .populate('orderId', 'orderCode')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ 
      success: true, 
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        reviewsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET PRODUCT REVIEWS
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest'; // newest, rating-high, rating-low
    const skip = (page - 1) * limit;

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'rating-high':
        sortObj = { rating: -1, createdAt: -1 };
        break;
      case 'rating-low':
        sortObj = { rating: 1, createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const totalReviews = await Review.countDocuments({ 
      productId, 
      isHidden: false 
    });
    
    const reviews = await Review.find({ productId, isHidden: false })
      .populate('userId', 'name avatar')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    // Get product rating stats
    const product = await Product.findById(productId).select('rating numReviews ratingBreakdown');

    res.json({ 
      success: true, 
      reviews,
      stats: {
        averageRating: product.rating,
        totalReviews: product.numReviews,
        ratingBreakdown: product.ratingBreakdown
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        reviewsPerPage: limit
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ UPDATE REVIEW
export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;

    const review = await Review.findOne({ _id: reviewId, userId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đánh giá' 
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    await review.populate(['userId', 'productId']);

    // Update product rating
    const product = await Product.findById(review.productId);
    await product.updateRatingFromReviews();

    res.json({ 
      success: true, 
      review,
      message: 'Cập nhật đánh giá thành công' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ DELETE REVIEW
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await Review.findOneAndDelete({ _id: reviewId, userId });
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đánh giá' 
      });
    }

    // Update product rating
    const product = await Product.findById(review.productId);
    await product.updateRatingFromReviews();

    res.json({ 
      success: true, 
      message: 'Xóa đánh giá thành công' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Reply to review
export const replyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { content } = req.body;
    const adminId = req.user.id;

    const review = await Review.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy đánh giá' 
      });
    }

    review.reply = {
      content,
      repliedAt: new Date(),
      repliedBy: adminId
    };

    await review.save();
    await review.populate(['userId', 'productId', 'reply.repliedBy']);

    res.json({ 
      success: true, 
      review,
      message: 'Phản hồi đánh giá thành công' 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
