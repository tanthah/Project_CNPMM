import User from '../models/User.js';

// Middleware kiểm tra role
export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      // Lấy thông tin user từ database
      const user = await User.findById(req.user.id).select('role');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Người dùng không tồn tại'
        });
      }

      // Kiểm tra role
      if (!roles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này'
        });
      }

      // Gắn role vào req để sử dụng sau này
      req.user.role = user.role;
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền truy cập',
        error: error.message
      });
    }
  };
};

// Middleware chỉ cho phép user truy cập tài nguyên của chính họ
export const authorizeOwner = (resourceField = 'userId') => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const resourceId = req.params.id || req.params[resourceField];

      // Nếu là admin thì cho phép
      const user = await User.findById(userId).select('role');
      if (user.role === 'admin') {
        return next();
      }

      // Kiểm tra xem resource có thuộc về user không
      // Logic này tùy thuộc vào model của bạn
      if (resourceId && resourceId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền sở hữu',
        error: error.message
      });
    }
  };
};

// Middleware kiểm tra admin
export const isAdmin = authorize('admin');

// Middleware kiểm tra user hoặc admin
export const isUserOrAdmin = authorize('user', 'admin');

// Middleware chỉ cho phép user
export const isUser = authorize('user');