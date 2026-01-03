import helmet from 'helmet';
import hpp from 'hpp';
import xss from 'xss-clean';

// Cấu hình Helmet cho bảo mật headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
});

// Middleware chống XSS attacks
export const xssProtection = xss();

// Middleware chống HTTP Parameter Pollution
export const hppProtection = hpp();

// Middleware sanitize dữ liệu đầu vào
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        // Loại bỏ các ký tự đặc biệt nguy hiểm
        req.body[key] = req.body[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  // Sanitize query
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = req.query[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  // Sanitize params
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = req.params[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    });
  }

  next();
};

// Middleware kiểm tra Content-Type
export const checkContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    // Cho phép multipart/form-data cho upload file
    if (req.path.includes('upload')) {
      return next();
    }

    if (!contentType || (!contentType.includes('application/json') && !contentType.includes('multipart/form-data'))) {
      return res.status(400).json({
        success: false,
        message: 'Content-Type phải là application/json hoặc multipart/form-data'
      });
    }
  }
  next();
};

// Middleware chống brute force cho sensitive endpoints
const loginAttempts = new Map();

export const bruteForceProtection = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  const attempts = loginAttempts.get(ip);
  const timeDiff = now - attempts.firstAttempt;

  // Reset sau 1 giờ
  if (timeDiff > 3600000) {
    loginAttempts.set(ip, { count: 1, firstAttempt: now });
    return next();
  }

  // Chặn sau 10 lần thử trong 1 giờ
  if (attempts.count >= 10) {
    return res.status(429).json({
      success: false,
      message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 1 giờ'
    });
  }

  attempts.count++;
  next();
};

// Cleanup loginAttempts mỗi giờ
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > 3600000) {
      loginAttempts.delete(ip);
    }
  }
}, 3600000);