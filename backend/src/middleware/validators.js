import { body, validationResult } from 'express-validator';

// Middleware để xử lý lỗi validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Validation cho đăng ký
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ được chứa chữ cái'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'),

  body('confirmPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu không được để trống')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),

  body('phone')
    .optional()
    .matches(/^(0|\+84)[0-9]{9,10}$/).withMessage('Số điện thoại không hợp lệ'),

  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 13) {
        throw new Error('Bạn phải trên 13 tuổi');
      }
      if (age > 120) {
        throw new Error('Ngày sinh không hợp lệ');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),

  handleValidationErrors
];

// Validation cho đăng nhập
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),

  handleValidationErrors
];

// Validation cho quên mật khẩu
export const forgotPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  handleValidationErrors
];

// Validation cho xác thực OTP
export const verifyOtpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('otp')
    .notEmpty().withMessage('OTP không được để trống')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số')
    .isNumeric().withMessage('OTP chỉ được chứa số'),

  handleValidationErrors
];

// Validation cho đặt lại mật khẩu
export const resetPasswordValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('otp')
    .notEmpty().withMessage('OTP không được để trống')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số')
    .isNumeric().withMessage('OTP chỉ được chứa số'),

  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/).withMessage('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt'),

  handleValidationErrors
];

// Validation cho cập nhật profile
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ được chứa chữ cái'),

  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('phone')
    .optional({ values: 'falsy' }) // Allow empty string, null, undefined
    .matches(/^(0|\+84)[0-9]{9,10}$/).withMessage('Số điện thoại không hợp lệ'),

  body('dateOfBirth')
    .optional({ values: 'falsy' }) // Allow empty string, null, undefined
    .isISO8601().withMessage('Ngày sinh không hợp lệ')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 13 || age > 120) {
        throw new Error('Ngày sinh không hợp lệ');
      }
      return true;
    }),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other']).withMessage('Giới tính không hợp lệ'),

  handleValidationErrors
];

// Validation cho gửi OTP đăng ký
export const sendRegisterOtpValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  handleValidationErrors
];

// Validation cho hoàn tất đăng ký
export const completeRegisterValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự'),

  body('confirmPassword')
    .notEmpty().withMessage('Xác nhận mật khẩu không được để trống')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Mật khẩu xác nhận không khớp');
      }
      return true;
    }),

  body('otp')
    .notEmpty().withMessage('OTP không được để trống')
    .isLength({ min: 6, max: 6 }).withMessage('OTP phải có 6 chữ số')
    .isNumeric().withMessage('OTP chỉ được chứa số'),

  handleValidationErrors
];