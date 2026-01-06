import Comment from '../models/Comment.js'

export const createComment = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, content, images, parentId } = req.body

    if (!productId || !content?.trim()) {
      return res.status(400).json({ success: false, message: 'Thiếu sản phẩm hoặc nội dung' })
    }

    const comment = await Comment.create({
      userId,
      productId,
      content: content.trim(),
      images: images || [],
      parentId: parentId || null
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
    const limit = parseInt(req.query.limit) || 100 // Tăng giới hạn mặc định cho phân luồng
    const skip = (page - 1) * limit

    // Tự động di chuyển: Chuyển đổi adminReply cũ sang tài liệu Comment
    const legacyComments = await Comment.find({ productId, adminReply: { $exists: true } });
    if (legacyComments.length > 0) {
      for (const leg of legacyComments) {
        if (leg.adminReply && leg.adminReply.content) {
          await Comment.create({
            productId: leg.productId,
            content: leg.adminReply.content,
            parentId: leg._id,
            isAdmin: true,
            createdAt: leg.adminReply.repliedAt || new Date()
          });
          leg.adminReply = undefined;
          await leg.save();
        }
      }
    }

    // Logic mới: Lấy TẤT CẢ bình luận để xây dựng cây phía client.
    // Nếu bắt buộc phân trang, chúng ta cần aggregation phức tạp hơn.
    // Hiện tại, lấy tất cả cho sản phẩm là cách an toàn nhất để đảm bảo, đầy đủ các luồng.

    const comments = await Comment.find({ productId, isHidden: false })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })

    // Định dạng trả về tuân thủ cấu trúc phân trang (ngay cả khi trả về tất cả)
    res.json({
      success: true,
      comments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalComments: comments.length,
        perPage: comments.length
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

export const toggleLike = async (req, res) => {
  try {
    const userId = req.user.id
    const { commentId } = req.params

    const comment = await Comment.findById(commentId)
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận' })
    }

    const index = comment.likes.indexOf(userId)
    if (index === -1) {
      comment.likes.push(userId)
    } else {
      comment.likes.splice(index, 1)
    }

    await comment.save()
    res.json({ success: true, likes: comment.likes })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

