import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không tìm thấy'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = { id: decoded.sub };
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token không hợp lệ',
      error: error.message
    });
  }
};