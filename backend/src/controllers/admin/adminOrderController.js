import Order from '../../models/Order.js'
import Product from '../../models/Product.js'
import PendingReview from '../../models/PendingReview.js'

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, search } = req.query
    console.log('[AdminOrders] requester:', req.user)
    console.log('[AdminOrders] query:', { status, search })
    const query = {}
    if (status) query.status = status
    if (search) {
      query.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ]
    }
    const orders = await Order.find(query)
      .populate(['items.productId', 'addressId', 'userId'])
      .sort({ createdAt: -1 })
    console.log('[AdminOrders] found:', orders?.length || 0)
    res.json({ success: true, orders, count: orders.length })
  } catch (err) {
    console.error('[AdminOrders] error:', err?.message)
    console.error('[AdminOrders] stack:', err?.stack)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const getOrderDetailAdmin = async (req, res) => {
  try {
    const { id } = req.params
    console.log('[AdminOrders] get detail id:', id)
    const order = await Order.findById(id).populate(['items.productId', 'addressId', 'userId'])
    if (!order) {
      console.warn('[AdminOrders] not found:', id)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }
    res.json({ success: true, order })
  } catch (err) {
    console.error('[AdminOrders] detail error:', err?.message)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const updateOrderStatusAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { status, note } = req.body
    console.log('[AdminOrders] update status:', { id, status, note })

    const allowedStatuses = new Set([
      'new',
      'confirmed',
      'preparing',
      'shipping',
      'completed',
      'cancelled',
      'cancel_requested'
    ])
    if (!allowedStatuses.has(status)) {
      console.warn('[AdminOrders] invalid status:', status)
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' })
    }

    const order = await Order.findById(id)
    if (!order) {
      console.warn('[AdminOrders] order not found:', id)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      console.warn('[AdminOrders] terminal status:', order.status)
      return res.status(400).json({ success: false, message: 'Không thể cập nhật trạng thái cho đơn hàng đã kết thúc' })
    }

    const validNext = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['shipping', 'cancelled'],
      shipping: ['completed'],
      cancel_requested: [] // handled via cancel-request endpoint
    }
    const current = order.status
    const nextList = validNext[current] || []
    if (!nextList.includes(status)) {
      console.warn('[AdminOrders] invalid transition:', { from: current, to: status })
      return res.status(400).json({ success: false, message: `Không thể chuyển từ '${current}' sang '${status}'` })
    }

    if (status === 'cancelled') {
      console.log('[AdminOrders] restoring stock for cancelled order:', id)
      for (const item of order.items) {
        const product = await Product.findById(item.productId)
        if (product) {
          product.stock += item.quantity
          product.sold -= item.quantity
          await product.save()
          console.log('[AdminOrders] restored product:', { productId: product._id, qty: item.quantity })
        }
      }
      order.cancelReason = note || 'Admin hủy đơn'
    }

    await order.updateStatus(status, note, 'admin')
    // When order completed, create pending review tasks
    if (status === 'completed') {
      for (const item of order.items) {
        try {
          await PendingReview.updateOne(
            { userId: order.userId, orderId: order._id, productId: item.productId },
            { $setOnInsert: { status: 'pending' } },
            { upsert: true }
          )
        } catch (e) {
          console.warn('[AdminOrders] pending review upsert warn:', e?.message)
        }
      }
    }
    console.log('[AdminOrders] status updated:', { id, to: status })
    res.json({ success: true, order, message: 'Cập nhật trạng thái đơn hàng thành công' })
  } catch (err) {
    console.error('[AdminOrders] update error:', err?.message)
    console.error('[AdminOrders] stack:', err?.stack)
    res.status(500).json({ success: false, message: err.message })
  }
}

export const handleCancelRequestAdmin = async (req, res) => {
  try {
    const { id } = req.params
    const { action, rejectionReason } = req.body // 'approve' | 'reject'
    console.log('[AdminOrders] handle cancel request:', { id, action, rejectionReason })

    const order = await Order.findById(id)
    if (!order) {
      console.warn('[AdminOrders] order not found:', id)
      return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' })
    }

    if (order.status !== 'cancel_requested') {
      console.warn('[AdminOrders] no cancel request for order:', id)
      return res.status(400).json({ success: false, message: 'Đơn hàng không có yêu cầu hủy' })
    }

    if (action === 'approve') {
      console.log('[AdminOrders] approving cancel request:', id)
      for (const item of order.items) {
        const product = await Product.findById(item.productId)
        if (product) {
          product.stock += item.quantity
          product.sold -= item.quantity
          await product.save()
          console.log('[AdminOrders] restored product:', { productId: product._id, qty: item.quantity })
        }
      }
      await order.updateStatus('cancelled', 'Yêu cầu hủy được chấp thuận', 'admin')
      order.cancellationInfo.approvedBy = req.user.id
      return res.json({ success: true, order, message: 'Đã chấp thuận yêu cầu hủy đơn' })
    }

    if (action === 'reject') {
      console.log('[AdminOrders] rejecting cancel request:', id)
      await order.updateStatus('preparing', `Từ chối yêu cầu hủy: ${rejectionReason || ''}`, 'admin')
      order.cancellationInfo.rejectionReason = rejectionReason
      return res.json({ success: true, order, message: 'Đã từ chối yêu cầu hủy đơn' })
    }

    console.warn('[AdminOrders] invalid action:', action)
    return res.status(400).json({ success: false, message: 'Action không hợp lệ' })
  } catch (err) {
    console.error('[AdminOrders] handle cancel error:', err?.message)
    console.error('[AdminOrders] stack:', err?.stack)
    res.status(500).json({ success: false, message: err.message })
  }
}
