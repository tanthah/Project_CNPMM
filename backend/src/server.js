
import 'dotenv/config'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import connectDB from './config/db.js'
import passport from './config/passport.js'

// Import routes
import authRoutes from './routes/auth.js'
import registerRoutes from './routes/registerRoutes.js'
import editUserRoutes from './routes/editUserRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import addressRoutes from './routes/addressRoutes.js'
import categoryRoutes from "./routes/categoryRoutes.js"

import reviewRoutes from './routes/reviewRoutes.js'
import wishlistRoutes from './routes/wishlistRoutes.js'
import viewedProductRoutes from './routes/viewedProductRoutes.js'
import loyaltyRoutes from './routes/loyaltyRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import faqRoutes from './routes/faqRoutes.js'
import faqCategoryRoutes from './routes/faqCategoryRoutes.js'
import settingRoutes from './routes/settingRoutes.js'
import subscribeRoutes from './routes/subscribeRoutes.js'
import adminUserRoutes from './routes/adminUserRoutes.js'

// Import middleware bảo mật
import {
  hppProtection,
  checkContentType
} from './middleware/security.js'
import { generalLimiter } from './middleware/rateLimiter.js'

// Import cron jobs
import { startOrderAutoConfirm } from './utils/orderCronJobs.js'

// Import admin routes
// import adminRoutes from './routes/admin/adminRoutes.js'

// Import socket handler
import { initializeSocket } from './sockets/socketHandler.js'

const app = express()
const httpServer = createServer(app)
const PORT = process.env.PORT || 5000

// Khởi tạo Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:4000',
      'http://localhost:4001'
    ],
    credentials: true,
    methods: ['GET', 'POST']
  }
})

// Khởi tạo các handler cho socket
initializeSocket(io)

// CORS
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:4000',
    'http://localhost:4001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}))

// Middleware Bảo Mật
app.use(hppProtection)
//app.use(generalLimiter)

// Trình phân tích cú pháp body
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Kiểm tra Content-Type
app.use(checkContentType)

// Kết nối cơ sở dữ liệu
connectDB()

// Khởi động các tác vụ định kỳ (cron jobs)
startOrderAutoConfirm()

// Các file tĩnh
app.use('/uploads', express.static('uploads'))

// Khởi tạo Passport
app.use(passport.initialize())

// Các API Route
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
app.use('/api/notifications', notificationRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/settings', settingRoutes)
app.use('/api/subscribe', subscribeRoutes)
app.use('/api/users/admin', adminUserRoutes)
app.use('/api/faq-categories', faqCategoryRoutes)

// Thêm dòng này với các route khác:
// app.use('/api/admin', adminRoutes)

// Kiểm tra sức khỏe hệ thống (Health check)
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  })
})

// Xử lý lỗi toàn cục
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

// Khởi động Server với WebSocket
httpServer.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`)
  console.log(`Security middlewares đã được kích hoạt`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`CORS enabled for: http://localhost:5173`)
  console.log(`Cron jobs đã được kích hoạt`)
  console.log(`New features: Reviews, Wishlist, Loyalty Points, Coupons`)
  console.log(`WebSocket: Notifications enabled`)
  console.log(`FAQ Chatbot ready`)
})

export default app

