// backend/src/routes/registerRoutes.js
import express from "express";
import {
  sendRegisterOtp,
  verifyRegisterOtp,
  completeRegistration
} from '../controllers/registerController.js';

// Import validators
import {
  sendRegisterOtpValidation,
  verifyOtpValidation,
  completeRegisterValidation
} from '../middleware/validators.js';

// Import rate limiters
import {
  registerLimiter,
  otpLimiter,
  verifyOtpLimiter,
  uploadLimiter
} from '../middleware/rateLimiter.js';

// Import Cloudinary upload
import upload from '../utils/cloudinary.js';

const router = express.Router();

// SEND OTP FOR REGISTRATION
router.post("/send-register-otp",
  otpLimiter,
  sendRegisterOtpValidation,
  sendRegisterOtp
);

// VERIFY OTP
router.post("/verify-register-otp",
  verifyOtpLimiter,
  verifyOtpValidation,
  verifyRegisterOtp
);

// COMPLETE REGISTRATION (WITH OPTIONAL AVATAR UPLOAD)
router.post("/complete-register",
  registerLimiter,
  uploadLimiter,
  upload.single('avatar'), // Thêm Cloudinary upload middleware
  completeRegisterValidation,
  completeRegistration
);

export default router;