import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Temporary storage for OTP (in production, use Redis)
const otpStore = new Map();

// SEND OTP FOR REGISTRATION
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ 
        success: false,
        message: "Email đã tồn tại!" 
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with 10 minutes expiration
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    });

    // Log OTP for testing
    console.log(`🔑 OTP for ${email}: ${otp}`);

    // Send email
    try {
      const { sendEmail } = await import('../utils/sendEmail.js');
      await sendEmail({
        to: email,
        subject: 'Mã OTP đăng ký tài khoản',
        text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
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

// VERIFY OTP
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

// COMPLETE REGISTRATION (WITH OPTIONAL AVATAR)
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

    // Verify OTP one more time
    const storedData = otpStore.get(email);
    if (!storedData || storedData.otp !== otp || storedData.expiresAt < Date.now()) {
      return res.status(400).json({ 
        success: false,
        message: "OTP không hợp lệ hoặc đã hết hạn!" 
      });
    }

    // Check if email already exists
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ 
        success: false,
        message: "Email đã tồn tại!" 
      });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Get avatar URL from Cloudinary (if exists)
    let avatarUrl = '';
    if (req.file) {
      avatarUrl = req.file.path; // Cloudinary URL
      console.log('📸 Avatar uploaded to Cloudinary:', avatarUrl);
    }

    // Create user
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

    // Clear OTP after successful registration
    otpStore.delete(email);

    // Generate JWT token
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

// Cleanup expired OTPs every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 15 * 60 * 1000);

export { otpStore };