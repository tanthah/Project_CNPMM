import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/auth.js'
import registerRoutes from './src/routes/registerRoutes.js'
import connectDB from './src/config/db.js'
import editUserRoutes from './src/routes/editUserRoutes.js'

// Import security middlewares
import { 
  helmetConfig, 
  xssProtection, 
  hppProtection, 
  sanitizeInput,
  checkContentType 
} from './src/middleware/security.js'
import { generalLimiter } from './src/middleware/rateLimiter.js'

const app = express()
const PORT = process.env.PORT || 4000

// ===== SECURITY MIDDLEWARES =====
// 1. Helmet - Bảo mật HTTP headers
app.use(helmetConfig)

// 2. XSS Protection - Chống tấn công XSS
//app.use(xssProtection)

// 3. HPP Protection - Chống HTTP Parameter Pollution
app.use(hppProtection)

// 4. Rate Limiting - Giới hạn số request
app.use(generalLimiter)

// 5. CORS Configuration
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// 6. Body parsers với giới hạn kích thước
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 7. Sanitize input data
//app.use(sanitizeInput)

// 8. Check Content-Type
app.use(checkContentType)

// ===== DATABASE CONNECTION =====
connectDB()

// ===== STATIC FILES =====
app.use('/uploads', express.static('uploads'))

// ===== API ROUTES =====
app.use('/api/auth', authRoutes)
app.use('/api/auth', registerRoutes)
app.use('/api/user', editUserRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// ===== ERROR HANDLING =====
// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token đã hết hạn'
    })
  }

  // Multer file upload errors
  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Lỗi upload file: ' + err.message
    })
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Có lỗi xảy ra trên server!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
  console.log(`🔒 Security middlewares đã được kích hoạt`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app