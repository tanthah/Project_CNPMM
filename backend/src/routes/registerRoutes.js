
import express from "express";
import {
  sendRegisterOtp,
  verifyRegisterOtp,
  completeRegistration
} from '../controllers/registerController.js';

// Import các validator
import {
  sendRegisterOtpValidation,
  verifyOtpValidation,
  completeRegisterValidation
} from '../middleware/validators.js';

// Import bộ giới hạn tốc độ
import {
  registerLimiter,
  otpLimiter,
  verifyOtpLimiter,
  uploadLimiter
} from '../middleware/rateLimiter.js';

// Import upload Cloudinary
import upload from '../utils/cloudinary.js';

const router = express.Router();

// GỬI OTP ĐỂ ĐĂNG KÝ
router.post("/send-register-otp",
  otpLimiter,
  sendRegisterOtpValidation,
  sendRegisterOtp
);

// XÁC THỰC OTP
router.post("/verify-register-otp",
  verifyOtpLimiter,
  verifyOtpValidation,
  verifyRegisterOtp
);

// HOÀN TẤT ĐĂNG KÝ (VỚI UPLOAD AVATAR TÙY CHỌN)
router.post("/complete-register",
  registerLimiter,
  uploadLimiter,
  upload.single('avatar'), // Thêm Cloudinary upload middleware
  completeRegisterValidation,
  completeRegistration
);

export default router;