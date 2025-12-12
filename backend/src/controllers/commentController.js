import Comment from '../models/Comment.js'

export const createComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, content, images } = req.body

    if (!productId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu sản phẩm hoặc nội dung' })
    }

    const comment = await Comment.create({
      userId,
      productId,
      content: content.trim(),
      images: images || []
    })

    await comment.populate('userId', 'name avatar')

    res.status(201).json({ success: true, comment })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getProductComments = async (req, res) => {
  try {
    const { productId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Comment.countDocuments({ productId, isHidden: false })
    const comments = await Comment.find({ productId, isHidden: false })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        perPage: limit
      }
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const deleteComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { commentId } = req.params

    const comment = await Comment.findOneAndDelete({ _id: commentId, userId })
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' })
    }

    res.json({ success: true, message: 'Xóa bình luận thành công' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

