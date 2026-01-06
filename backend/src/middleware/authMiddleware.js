import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import TokenBlacklist from '../models/TokenBlacklist.js';

export const authenticateToken = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không tìm thấy. Vui lòng đăng nhập'
      });
    }

    // Kiểm tra danh sách đen
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hiệu lực (Đã đăng xuất)'
      });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

    // Kiểm tra user có tồn tại không
    const user = await User.findById(decoded.sub).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    // Gắn thông tin user vào request
    req.user = {
      id: decoded.sub,
      email: user.email,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

// Middleware xác thực tùy chọn (không bắt buộc phải có token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
      const user = await User.findById(decoded.sub).select('-password');

      if (user) {
        req.user = {
          id: decoded.sub,
          email: user.email,
          role: user.role,
          name: user.name
        };
      }
    }

    next();
  } catch (error) {
    // Nếu có lỗi, vẫn cho phép tiếp tục nhưng không có thông tin user
    next();
  }
};