import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  content: { type: String, required: true, trim: true },
  images: [{ type: String }],
  isHidden: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },
  adminReply: {
    content: String,
    repliedAt: Date
  }
}, { timestamps: true })

commentSchema.index({ productId: 1, createdAt: -1 })
commentSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)

