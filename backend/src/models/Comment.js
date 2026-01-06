import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  content: { type: String, required: true, trim: true },
  images: [{ type: String }],
  isHidden: { type: Boolean, default: false },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  isAdmin: { type: Boolean, default: false },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

commentSchema.index({ productId: 1, createdAt: -1 })
commentSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Comment', commentSchema)

