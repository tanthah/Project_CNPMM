import rateLimit from 'express-rate-limit';

// Rate limiter chung cho tất cả các request
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 100, // Giới hạn 100 requests mỗi windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho đăng nhập (nghiêm ngặt hơn)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần thử đăng nhập
  message: {
    success: false,
    message: 'Quá nhiều lần đăng nhập thất bại, vui lòng thử lại sau 15 phút'
  },
  skipSuccessfulRequests: true, // Không đếm request thành công
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho đăng ký
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 3, // Giới hạn 3 lần đăng ký mỗi giờ
  message: {
    success: false,
    message: 'Quá nhiều lần đăng ký, vui lòng thử lại sau 1 giờ'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho gửi OTP
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 phút
  max: 3, // Giới hạn 3 lần gửi OTP mỗi 5 phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu gửi OTP, vui lòng thử lại sau 5 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho xác thực OTP
export const verifyOtpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 5, // Giới hạn 5 lần thử xác thực OTP
  message: {
    success: false,
    message: 'Quá nhiều lần thử xác thực OTP, vui lòng thử lại sau 15 phút'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho upload file
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, // Giới hạn 10 lần upload mỗi 15 phút
  message: {
    success: false,
    message: 'Quá nhiều lần upload file, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter cho API endpoints
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 30, // Giới hạn 30 requests mỗi phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu API, vui lòng thử lại sau'
  },
  standardHeaders: true,
  legacyHeaders: false,
});