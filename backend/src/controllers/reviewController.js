
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';
import { Coupon } from '../models/Coupon.js';

// ✅ TẠO ĐÁNH GIÁ (Chỉ cho đơn hàng đã hoàn thành)
export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, orderId, rating, comment, images } = req.body;

    // Xác thực đầu vào
    if (!productId || !orderId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc'
      });
    }

    // Kiểm tra đơn hàng có tồn tại và đã hoàn thành không
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

    // Kiểm tra sản phẩm có trong đơn hàng không
    const orderItem = order.items.find(
      item => item.productId.toString() === productId
    );

    if (!orderItem) {
      return res.status(400).json({
        success: false,
        message: 'Sản phẩm không có trong đơn hàng này'
      });
    }

    // Kiểm tra xem người dùng đã đánh giá sản phẩm này trong đơn hàng này chưa
    const canReview = await Review.canUserReview(userId, productId, orderId);

    if (!canReview) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đánh giá sản phẩm này rồi'
      });
    }

    // Tạo đánh giá
    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment: comment || '',
      images: images || []
    });

    await review.populate(['userId', 'productId']);

    // Cập nhật đánh giá sản phẩm
    const product = await Product.findById(productId);
    await product.updateRatingFromReviews();


    // ✅ THƯỞNG: Tặng điểm thưởng
    let loyaltyPoints = await LoyaltyPoint.findOne({ userId });

    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoint.create({ userId });
    }

    const pointsEarned = 5; // 5 điểm cho mỗi review
    await loyaltyPoints.addPoints(
      pointsEarned,
      `Đánh giá sản phẩm: ${product.name}`,
      review._id,
      'review'
    );

    res.status(201).json({
      success: true,
      review,
      rewards: {
        points: pointsEarned
      },
      message: 'Đánh giá thành công! Bạn nhận được 5 điểm'
    });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ LẤY ĐÁNH GIÁ CHỜ (Sản phẩm từ đơn hàng đã hoàn thành chưa được đánh giá)
export const getPendingReviews = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả đơn hàng đã hoàn thành
    const completedOrders = await Order.find({
      userId,
      status: 'completed'
    }).populate('items.productId');

    // Lấy tất cả các cặp sản phẩm-đơn hàng đã đánh giá
    const reviews = await Review.find({ userId }).select('productId orderId');
    const reviewedSet = new Set(
      reviews.map(r => `${r.productId}-${r.orderId}`)
    );

    // Tìm sản phẩm cần đánh giá
    const pendingReviews = [];

    for (const order of completedOrders) {
      for (const item of order.items) {
        // Bỏ qua nếu thiếu thông tin sản phẩm (sản phẩm đã xóa)
        if (!item.productId) continue;

        const key = `${item.productId._id}-${order._id}`;

        if (!reviewedSet.has(key)) {
          pendingReviews.push({
            orderId: order._id,
            orderCode: order.orderCode,
            completedAt: order.completedAt,
            product: {
              _id: item.productId._id,
              name: item.productId.name,
              images: item.productId.images,
              price: item.price,
              quantity: item.quantity
            }
          });
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

// ✅ LẤY ĐÁNH GIÁ CỦA USER
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

// ✅ LẤY ĐÁNH GIÁ SẢN PHẨM
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest'; // newest, rating-high, rating-low
    const skip = (page - 1) * limit;

    // Xây dựng đối tượng sắp xếp
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

    // Lấy thống kê đánh giá sản phẩm
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

// ✅ CẬP NHẬT ĐÁNH GIÁ
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

    // Cập nhật các trường
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;

    await review.save();
    await review.populate(['userId', 'productId']);

    // Cập nhật đánh giá sản phẩm
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

// ✅ XÓA ĐÁNH GIÁ
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

    // Cập nhật đánh giá sản phẩm
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



// ✅ ADMIN: Lấy tất cả đánh giá
export const getAllReviewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, rating, status, dateFrom, dateTo } = req.query;
    const query = {};

    if (status === 'hidden') query.isHidden = true;
    if (status === 'visible') query.isHidden = false;
    if (rating) query.rating = parseInt(rating);

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Tìm kiếm theo nội dung hoặc tên người dùng (cần tối ưu hóa cho dữ liệu lớn)
    if (q) {
      // Chưa bao gồm tìm kiếm tên sản phẩm để tuân thủ giới hạn chặt chẽ, nhưng có thể thêm qua populate match nếu cần
      query.comment = { $regex: q, $options: 'i' };
    }

    const reviews = await Review.find(query)
      .populate('userId', 'name email avatar')
      .populate('productId', 'name image')
      .populate('orderId', 'orderCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        items: reviews,
        total,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Lấy thống kê đánh giá
export const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();

    // Đánh giá mới trong 7 ngày qua
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newReviews = await Review.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Đánh giá thấp (1-2 sao)
    const lowRatingReviews = await Review.countDocuments({ rating: { $lte: 2 } });

    // Đánh giá trung bình
    const avgResult = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    const avgRating = avgResult.length ? avgResult[0].avg : 0;

    res.json({
      success: true,
      data: {
        totalReviews,
        newReviews,
        lowRatingReviews,
        avgRating: parseFloat(avgRating.toFixed(1))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Chuyển đổi trạng thái hiển thị
export const toggleReviewVisibility = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { isHidden } = req.body; // Mong đợi kiểu boolean

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { isHidden },
      { new: true }
    );

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Có nên cập nhật thống kê sản phẩm? Đánh giá ẩn không nên tính?
    // Hiện tại, hãy giữ chúng trong thống kê hoặc tính lại nếu chính sách yêu cầu.
    // Thông thường đánh giá ẩn bị loại khỏi chế độ xem công khai nhưng vẫn có thể tồn tại.
    // Lý tưởng nhất là kích hoạt tính lại đánh giá sản phẩm nếu tránh các đánh giá bị ẩn.
    const product = await Product.findById(review.productId);
    await product.updateRatingFromReviews();

    res.json({ success: true, message: 'Cập nhật trạng thái thành công', review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Xóa đánh giá
export const deleteReviewAdmin = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    // Cập nhật đánh giá sản phẩm
    const product = await Product.findById(review.productId);
    if (product) await product.updateRatingFromReviews();

    res.json({ success: true, message: 'Đã xóa đánh giá' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};