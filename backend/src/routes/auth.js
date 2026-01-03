import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Import validators
import {
  loginValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation
} from '../middleware/validators.js'

// Import rate limiters
import {
  loginLimiter,
  otpLimiter,
  verifyOtpLimiter
} from '../middleware/rateLimiter.js'

// Import security
import { bruteForceProtection } from '../middleware/security.js'

const router = express.Router()

// POST /api/auth/login
// Rate limited + Validation + Brute force protection
router.post('/login',
  loginLimiter,
  bruteForceProtection,
  loginValidation,
  async (req, res) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        })
      }

      const ok = bcrypt.compareSync(password, user.password)
      if (!ok) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng'
        })
      }

      const token = jwt.sign(
        { sub: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      })
    }
  }
)

// POST /api/auth/forgot-password
// Rate limited + Validation
router.post('/forgot-password',
  otpLimiter,
  forgotPasswordValidation,
  async (req, res) => {
    try {
      const { email } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        // Không tiết lộ email có tồn tại hay không (bảo mật)
        return res.json({
          success: true,
          message: 'Nếu email tồn tại, OTP đã được gửi'
        })
      }

      // Tạo OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString()

      // Lưu OTP và thời gian hết hạn (10 phút)
      user.resetPasswordOtp = otp
      user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
      await user.save()

      // Log OTP ra console (chế độ test)
      console.log('🔑 TEST OTP (Copy mã này):', otp)

      // Gửi email
      try {
        const { sendEmail } = await import('../utils/sendEmail.js')
        await sendEmail({
          to: email,
          subject: 'Mã OTP đặt lại mật khẩu',
          text: `Mã OTP của bạn là: ${otp}. Mã này có hiệu lực trong 10 phút.`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
              <h2>Đặt lại mật khẩu</h2>
              <p>Mã OTP của bạn là:</p>
              <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
              <p>Mã này có hiệu lực trong <strong>10 phút</strong>.</p>
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </div>
          `
        })
      } catch (emailErr) {
        console.log('⚠️ Không gửi được email:', emailErr.message)
      }

      res.json({
        success: true,
        message: 'Nếu email tồn tại, OTP đã được gửi'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      })
    }
  }
)

// POST /api/auth/verify-otp
// Rate limited + Validation
router.post('/verify-otp',
  verifyOtpLimiter,
  verifyOtpValidation,
  async (req, res) => {
    try {
      const { email, otp } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email không tồn tại'
        })
      }

      if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
        return res.status(400).json({
          success: false,
          message: 'Chưa yêu cầu đặt lại mật khẩu'
        })
      }

      if (user.resetPasswordOtpExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'OTP đã hết hạn'
        })
      }

      if (user.resetPasswordOtp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'OTP không đúng'
        })
      }

      res.json({
        success: true,
        message: 'OTP hợp lệ',
        verified: true
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      })
    }
  }
)

// POST /api/auth/reset-password
// Validation
router.post('/reset-password',
  resetPasswordValidation,
  async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email không tồn tại'
        })
      }

      if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
        return res.status(400).json({
          success: false,
          message: 'Chưa yêu cầu đặt lại mật khẩu'
        })
      }

      if (user.resetPasswordOtpExpires < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'OTP đã hết hạn'
        })
      }

      if (user.resetPasswordOtp !== otp) {
        return res.status(400).json({
          success: false,
          message: 'OTP không đúng'
        })
      }

      // Cập nhật mật khẩu mới
      const hash = bcrypt.hashSync(newPassword, 10)
      user.password = hash
      user.resetPasswordOtp = undefined
      user.resetPasswordOtpExpires = undefined
      await user.save()

      res.json({
        success: true,
        message: 'Đặt lại mật khẩu thành công'
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        success: false,
        message: 'Lỗi server'
      })
    }
  }
)

// ==================== GOOGLE OAUTH ====================
import passport from '../config/passport.js'

// GET /api/auth/google
// Redirect to Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
)

// GET /api/auth/google/callback
// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_auth_failed`
  }),
  async (req, res) => {
    try {
      const user = req.user

      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_user`)
      }

      // Tạo JWT token
      const token = jwt.sign(
        { sub: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Redirect về frontend với token
      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173'
      res.redirect(`${frontendURL}/auth/google/callback?token=${token}&userId=${user._id}`)
    } catch (error) {
      console.error('Google callback error:', error)
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`)
    }
  }
)

// GET /api/auth/google/user
// Get user info after Google login
router.get('/google/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password -resetPasswordOtp -resetPasswordOtpExpires')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại'
      })
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        isVerified: user.isVerified
      }
    })
  } catch (error) {
    console.error('Get Google user error:', error)
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    })
  }
})

export default router