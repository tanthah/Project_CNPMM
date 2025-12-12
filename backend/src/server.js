// backend/server.js - UPDATED WITH NEW ROUTES
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'

// Import routes
import authRoutes from './routes/auth.js'
import registerRoutes from './routes/registerRoutes.js'
import editUserRoutes from './routes/editUserRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import categoryRoutes from "./routes/categoryRoutes.js"

// ✅ NEW ROUTES
import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import viewedProductRoutes from './routes/viewedProductRoutes.js'
import loyaltyRoutes from './routes/loyaltyRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import commentRoutes from './routes/commentRoutes.js'

// Import security middlewares
import {
  hppProtection,
  checkContentType
} from './middleware/security.js'
import { generalLimiter } from './middleware/rateLimiter.js'

// Import cron jobs
import { startOrderAutoConfirm } from './utils/orderCronJobs.js'

// Import admin routes
import adminRoutes from './routes/admin/adminRoutes.js'

const app = express()
const PORT = process.env.PORT || 4000

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))

// Security Middlewares
app.use(hppProtection)
//app.use(generalLimiter)

// Body parsers
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Check Content-Type
app.use(checkContentType)

// Database Connection
connectDB()

// Start cron jobs
startOrderAutoConfirm()

// Static Files
app.use('/uploads', express.static('uploads'))

// API Routes
app.use('/api/auth', generalLimiter, authRoutes)
app.use('/api/register', generalLimiter, registerRoutes)

app.use('/api/user', editUserRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/addresses', addressRoutes)
app.use("/api/category", categoryRoutes)

app.use('/api/reviews', reviewRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/viewed', viewedProductRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/comments', commentRoutes)


// Add this line with other routes:
app.use('/api/admin', adminRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

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

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors: Object.values(err.errors).map(e => e.message)
    })
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu đã tồn tại'
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(400).json({
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

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Có lỗi xảy ra trên server!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`)
  console.log(`🔒 Security middlewares đã được kích hoạt`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS enabled for: http://localhost:5173`)
  console.log(`⏰ Cron jobs đã được kích hoạt`)
  console.log(`✅ New features: Reviews, Wishlist, Loyalty Points, Coupons`)
})

export default app
