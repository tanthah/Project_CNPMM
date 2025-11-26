import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Temporary storage for OTP (in production, use Redis)
const otpStore = new Map();

// SEND OTP FOR REGISTRATION
router.post("/send-register-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc!" });
    }

    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minutes expiration
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    });

    // Log OTP for testing
    console.log(`🔑 OTP for ${email}: ${otp}`);

    // Send email
    try {
      const { sendEmail } = await import('../utils/sendEmail.js');
      await sendEmail({
        to: email,
        subject: 'Mã OTP đăng ký tài khoản',
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 5 phút.`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0d6efd;">Xác thực đăng ký tài khoản</h2>
            <p>Mã OTP của bạn là:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
              <h1 style="color: #0d6efd; font-size: 36px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
            <p style="color: #6c757d; font-size: 14px;">Nếu bạn không yêu cầu đăng ký, vui lòng bỏ qua email này.</p>
          </div>
        `
      });
    } catch (emailErr) {
      console.log('⚠️ Không gửi được email:', emailErr.message);
    }

    return res.json({ 
      message: "Mã OTP đã được gửi đến email của bạn",
      success: true 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
});

// VERIFY OTP
router.post("/verify-register-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email và OTP là bắt buộc!" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: "OTP không tồn tại hoặc đã hết hạn!" });
    }

    if (storedData.expiresAt < Date.now()) {
      otpStore.delete(email);
      return res.status(400).json({ message: "OTP đã hết hạn!" });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: "OTP không đúng!" });
    }

    return res.json({ 
      message: "Xác thực OTP thành công",
      verified: true 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
});

// COMPLETE REGISTRATION
router.post("/complete-register", async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      confirmPassword, 
      phone, 
      dateOfBirth, 
      gender,
      otp
    } = req.body;

    // Verify OTP one more time
    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP không hợp lệ hoặc đã hết hạn!" });
    }

    // Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu nhập lại không khớp!" });
    }

    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email đã tồn tại!" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashed,
      phone,
      dateOfBirth,
      gender
    });

    // Clear OTP after successful registration
    otpStore.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    return res.json({ 
      message: "Đăng ký thành công!", 
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server!" });
  }
});

export default router;