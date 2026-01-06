
import { Coupon } from '../models/Coupon.js';
import Order from '../models/Order.js';

//  LẤY MÃ GIẢM GIÁ CÔNG KHAI (Cho Trang Mã giảm giá)
export const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();
    const query = {
      userId: null, // Chỉ mã giảm giá công khai
      isActive: true,
      expiryDate: { $gt: now },
      $or: [
        { maxUses: null },
        { $expr: { $lt: ['$usedCount', '$maxUses'] } }
      ]
    };

    const coupons = await Coupon.find(query).sort({ expiryDate: 1 }); // Sắp xếp theo ngày hết hạn (sớm nhất trước)

    res.json({
      success: true,
      coupons
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// LẤY MÃ GIẢM GIÁ CỦA USER
export const getUserCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status || 'active'; // active (hoạt động), expired (hết hạn), used (đã dùng)

    const now = new Date();
    let query = { userId };

    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gt: now };
      query.$or = [
        { maxUses: null },
        { $expr: { $lt: ['$usedCount', '$maxUses'] } }
      ];
    } else if (status === 'expired') {
      query.expiryDate = { $lte: now };
    } else if (status === 'used') {
      query.$expr = { $gte: ['$usedCount', '$maxUses'] };
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons,
      count: coupons.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  KIỂM TRA MÃ GIẢM GIÁ
export const validateCoupon = async (req, res) => {
  try {
    const userId = req.user.id;
    const { code, orderValue } = req.body;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      $or: [
        { userId: null }, // Mã giảm giá công khai
        { userId }       // Mã giảm giá dành riêng cho user
      ]
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Mã giảm giá không tồn tại'
      });
    }

    // Kiểm tra xem mã giảm giá có hợp lệ không
    const validation = coupon.isValid(orderValue);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // Tính toán giảm giá
    const discount = coupon.calculateDiscount(orderValue);

    res.json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discount,
        finalAmount: orderValue - discount
      },
      message: 'Mã giảm giá hợp lệ'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ÁP DỤNG MÃ GIẢM GIÁ VÀO ĐƠN HÀNG (được gọi khi tạo đơn hàng)
export const applyCouponToOrder = async (couponCode, userId, orderValue) => {
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    $or: [
      { userId: null },
      { userId }
    ]
  });

  if (!coupon) {
    throw new Error('Mã giảm giá không tồn tại');
  }

  const validation = coupon.isValid(orderValue);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const discount = coupon.calculateDiscount(orderValue);

  // Tăng số lượng đã sử dụng
  coupon.usedCount += 1;
  await coupon.save();

  return {
    discount,
    couponId: coupon._id
  };
};

// ADMIN: Tạo mã giảm giá công khai
export const createCoupon = async (req, res) => {
  try {
    const couponData = req.body;

    // Tạo mã duy nhất nếu chưa được cung cấp
    if (!couponData.code) {
      couponData.code = `PROMO${Date.now()}`;
    }

    const coupon = await Coupon.create(couponData);

    res.status(201).json({
      success: true,
      coupon,
      message: 'Tạo mã giảm giá thành công'
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Mã giảm giá đã tồn tại'
      });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: Lấy tất cả mã giảm giá
export const getAllCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const totalCoupons = await Coupon.countDocuments();

    const coupons = await Coupon.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      coupons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCoupons / limit),
        totalCoupons
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  ADMIN: Cập nhật mã giảm giá
export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      couponId,
      updates,
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    res.json({
      success: true,
      coupon,
      message: 'Cập nhật mã giảm giá thành công'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//  ADMIN: Xóa mã giảm giá
export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mã giảm giá'
      });
    }

    res.json({
      success: true,
      message: 'Xóa mã giảm giá thành công'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};