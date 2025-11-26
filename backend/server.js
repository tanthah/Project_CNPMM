import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './src/routes/auth.js'
import registerRoutes from './src/routes/registerRoutes.js'
import connectDB from './src/config/db.js'
import editUserRoutes from './src/routes/editUserRoutes.js'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Kết nối DB
connectDB();

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes)
app.use('/api/auth', registerRoutes)
app.use('/api/user', editUserRoutes)
app.get('/api/health', (req, res) => {
  res.json({ ok: true })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Có lỗi xảy ra trên server!' })
})


app.listen(PORT, () => console.log(`Server đang chạy tại http://localhost:${PORT}`));

export default app;