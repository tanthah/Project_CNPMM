import User from "../models/User.js";
import { Coupon } from "../models/Coupon.js";
import LoyaltyPoint from "../models/LoyaltyPoint.js";
import { sendWelcomeEmail, sendOtpEmail } from "../services/emailService.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Lưu trữ tạm thời cho OTP (trong sản xuất, sử dụng Redis)
const otpStore = new Map();

// GỬI OTP ĐỂ ĐĂNG KÝ
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!"
      });
    }

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP với thời hạn 10 phút
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Log OTP để kiểm thử
    console.log(`🔑 OTP for ${email}: ${otp}`);

    // Gửi email
    const emailResult = await sendOtpEmail(email, otp);

    if (!emailResult.success) {
      // Nếu gửi mail thất bại - LOG CHI TIẾT
      console.error('❌ GỬI OTP THẤT BẠI!');
      console.error('   - Email:', email);
      console.error('   - Lỗi:', emailResult.error);
      otpStore.delete(email); // Xóa OTP vừa tạo
      return res.status(500).json({
        success: false,
        message: "Không thể gửi OTP. Vui lòng kiểm tra lại email hoặc thử lại sau.",
        error: emailResult.error // Trả về lỗi chi tiết cho frontend
      });
    }

    return res.json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn"
    });

  } catch (err) {
    console.error('❌ sendRegisterOtp error:', err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
};

// XÁC THỰC OTP
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: "OTP không tồn tại hoặc đã hết hạn!"
      });
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: "OTP đã hết hạn!"
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP không đúng!"
      });
    }

    return res.json({
      success: true,
      message: "Xác thực OTP thành công",
      verified: true
    });

  } catch (err) {
    console.error('❌ verifyRegisterOtp error:', err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
};

// HOÀN TẤT ĐĂNG KÝ (VỚI AVATAR TÙY CHỌN)
export const completeRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      otp
    } = req.body;

    console.log('📝 Complete registration request:', { name, email, phone, hasAvatar: !!req.file });

    // Xác thực OTP một lần nữa
    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP không hợp lệ hoặc đã hết hạn!"
      });
    }

    // Kiểm tra xem email đã tồn tại chưa
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại!"
      });
    }

    // Mã hóa mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    // Lấy URL avatar từ Cloudinary (nếu có)
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL
      console.log('📸 Avatar uploaded to Cloudinary:', avatarUrl);
    }

    // Tạo user
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      dateOfBirth,
      gender,
      avatar: avatarUrl
    });

    console.log('✅ User created successfully:', { id: user._id, email: user.email, avatar: user.avatar });

    // Xóa OTP sau khi đăng ký thành công
    otpStore.delete(email);

    // === TẠO QUÀ TẶNG CHÀO MỪNG ===
    let couponCode = '';
    const welcomePoints = 20;

    try {
      // 1. Tạo mã giảm giá 10% cho người dùng mới
      // Tạo mã coupon unique: WELCOME + 6 ký tự random
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      couponCode = `WELCOME${randomCode}`;

      // Ngày hết hạn: 30 ngày kể từ hôm nay
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await Coupon.create({
        code: couponCode,
        type: 'percentage',
        value: 10, // Giảm 10%
        minOrderValue: 0, // Không giới hạn giá trị đơn hàng tối thiểu
        maxDiscount: 500000, // Giảm tối đa 500,000đ
        maxUses: 1, // Chỉ sử dụng 1 lần
        userId: user._id, // Coupon riêng cho user này
        expiryDate: expiryDate,
        isActive: true,
        source: 'registration',
        sourceId: user._id,
        description: 'Mã giảm giá 10% chào mừng thành viên mới'
      });

      console.log('🎁 Welcome coupon created:', couponCode);

      // 2. Cộng 20 điểm thưởng cho người dùng mới
      let loyaltyPoint = await LoyaltyPoint.findOne({ userId: user._id });

      if (!loyaltyPoint) {
        // Tạo mới LoyaltyPoint record cho user
        loyaltyPoint = new LoyaltyPoint({
          userId: user._id,
          totalPoints: 0,
          availablePoints: 0,
          usedPoints: 0,
          history: []
        });
      }

      // Cộng điểm chào mừng
      await loyaltyPoint.addPoints(
        welcomePoints,
        'Điểm thưởng chào mừng thành viên mới',
        user._id,
        'registration'
      );

      console.log('✨ Welcome points added:', welcomePoints);

      // 3. Gửi email chào mừng
      await sendWelcomeEmail(email, {
        name: name,
        couponCode: couponCode,
        points: welcomePoints
      });

    } catch (welcomeErr) {
      // Không fail đăng ký nếu gửi quà tặng thất bại
      console.error('⚠️ Failed to create welcome gifts:', welcomeErr.message);
    }

    // Tạo token JWT
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: "Đăng ký thành công!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (err) {
    console.error('❌ completeRegistration error:', err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server!"
    });
  }
};

// Dọn dẹp OTP hết hạn mỗi 15 phút
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 15 * 60 * 1000);

export { otpStore };