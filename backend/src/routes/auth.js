import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email đã tồn tại' })
    }

    const hash = bcrypt.hashSync(password, 10)

    const user = await User.create({ name, email, password: hash })

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const ok = bcrypt.compareSync(password, user.password)
    if (!ok) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' })
    }

    const token = jwt.sign(
      { sub: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )


    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})


// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email là bắt buộc' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return res.json({ message: 'Nếu email tồn tại, OTP đã được gửi' })
    }

    
    // Tạo OTP 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Lưu OTP và thời gian hết hạn (10 phút)
    user.resetPasswordOtp = otp
    user.resetPasswordOtpExpires = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    // --- CHẾ ĐỘ TEST: Log OTP ra console ---
    console.log('🔑 TEST OTP (Copy mã này):', otp)

    // Gửi email (nếu cấu hình)
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
      console.log('⚠️ Không gửi được email (không sao nếu đang test):', emailErr.message)
    }

    res.json({ message: 'Nếu email tồn tại, OTP đã được gửi' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email và OTP là bắt buộc' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' })
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: 'Chưa yêu cầu đặt lại mật khẩu' })
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP đã hết hạn' })
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'OTP không đúng' })
    }

    res.json({ message: 'OTP hợp lệ', verified: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP và mật khẩu mới là bắt buộc' })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'Email không tồn tại' })
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ message: 'Chưa yêu cầu đặt lại mật khẩu' })
    }

    if (user.resetPasswordOtpExpires < new Date()) {
      return res.status(400).json({ message: 'OTP đã hết hạn' })
    }

    if (user.resetPasswordOtp !== otp) {
      return res.status(400).json({ message: 'OTP không đúng' })
    }

    // Cập nhật mật khẩu mới
    const hash = bcrypt.hashSync(newPassword, 10)
    user.password = hash
    user.resetPasswordOtp = undefined
    user.resetPasswordOtpExpires = undefined
    await user.save()

    res.json({ message: 'Đặt lại mật khẩu thành công' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Lỗi server' })
  }
})

export default router

