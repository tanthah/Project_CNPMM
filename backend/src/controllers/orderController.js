
// backend/src/controllers/orderController.js - ENHANCED
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';

import * as notificationService from '../services/notificationService.js';
import * as emailService from '../services/emailService.js';
import { getIO } from '../sockets/socketHandler.js'; // Import getIO

// ✅ CREATE ORDER - Updated với status history
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, notes, shippingFee = 30000, items } = req.body;

        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy địa chỉ giao hàng'
            });
        }

        const orderItems = [];
        let totalProductsPrice = 0;

        if (Array.isArray(items) && items.length > 0) {
            for (const input of items) {
                const product = await Product.findById(input.productId);
                if (!product) {
                    return res.status(404).json({ success: false, message: 'Sản phẩm không tồn tại' });
                }
                const qty = parseInt(input.quantity) || 1;
                if (product.stock < qty) {
                    return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho` });
                }
                product.stock -= qty;
                product.sold += qty;
                await product.save();
                const priceToUse = product.finalPrice || product.price;
                orderItems.push({ productId: product._id, quantity: qty, price: priceToUse });
                totalProductsPrice += priceToUse * qty;

                // Real-time stock update
                try {
                    getIO().emit('product_updated', product);
                } catch (e) {
                    console.error('Socket emit error:', e);
                }
            }
        } else {
            const cart = await Cart.findOne({ userId }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ success: false, message: 'Giỏ hàng trống' });
            }
            for (const item of cart.items) {
                const product = await Product.findById(item.productId._id);
                if (!product) {
                    return res.status(404).json({ success: false, message: `Sản phẩm ${item.productName} không tồn tại` });
                }
                if (product.stock < item.quantity) {
                    return res.status(400).json({ success: false, message: `Sản phẩm ${product.name} chỉ còn ${product.stock} trong kho` });
                }
                product.stock -= item.quantity;
                product.sold += item.quantity;
                await product.save();
                orderItems.push({ productId: product._id, quantity: item.quantity, price: item.finalPrice });
                totalProductsPrice += item.finalPrice * item.quantity;

                // Real-time stock update
                try {
                    getIO().emit('product_updated', product);
                } catch (e) {
                    console.error('Socket emit error:', e);
                }
            }
            cart.items = [];
            cart.totalQuantity = 0;
            cart.totalPrice = 0;
            await cart.save();
        }

        const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 1000)} `;
        const totalPrice = totalProductsPrice + shippingFee;

        const order = await Order.create({
            orderCode,
            userId,
            items: orderItems,
            totalPrice,
            shippingFee,
            status: 'new',
            paymentStatus: 'unpaid',
            paymentMethod: 'COD',
            addressId,
            notes
        });

        await order.populate(['items.productId', 'addressId']);

        // ✅ SEND NOTIFICATION TO USER - Order placed
        try {
            await notificationService.createNotification({
                userId,
                type: 'order_placed',
                title: 'Đơn hàng đã đặt thành công',
                message: `Đơn hàng #${order.orderCode} đã được đặt thành công. Đơn hàng sẽ được xác nhận trong 30 phút.`,
                link: `/orders`
            });
        } catch (err) {
            console.error('Failed to create notification:', err);
        }

        res.status(201).json({
            success: true,
            order,
            message: 'Đặt hàng thành công! Đơn hàng sẽ được xác nhận trong 30 phút.'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ GET USER ORDERS - With status filtering
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        const query = { userId };
        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate(['items.productId', 'addressId'])
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders,
            count: orders.length
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ GET ORDER DETAIL - With full status history
export const getOrderDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, userId })
            .populate(['items.productId', 'addressId']);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            order,
            canDirectCancel: order.canDirectCancel,
            canRequestCancel: order.canRequestCancel
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ CANCEL ORDER - Enhanced với logic 30 phút
export const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;
        const { cancelReason } = req.body;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if already cancelled or completed
        if (order.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng đã được hủy trước đó'
            });
        }

        if (order.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng đã hoàn thành'
            });
        }

        // Check if can directly cancel (new or confirmed within 30 minutes)
        if (order.canDirectCancel) {
            // Direct cancellation - Restore stock
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    product.sold -= item.quantity;
                    await product.save();

                    // Real-time stock update
                    try {
                        getIO().emit('product_updated', product);
                    } catch (e) {
                        console.error('Socket emit error:', e);
                    }
                }
            }

            await order.updateStatus(
                'cancelled',
                cancelReason || 'Khách hàng hủy đơn trong 30 phút',
                'customer'
            );

            order.cancelReason = cancelReason || 'Khách hàng hủy đơn';

            return res.json({
                success: true,
                order,
                message: 'Đã hủy đơn hàng thành công'
            });
        }

        // If preparing - Create cancel request
        if (order.status === 'preparing') {
            await order.updateStatus(
                'cancel_requested',
                cancelReason || 'Khách hàng yêu cầu hủy đơn',
                'customer'
            );

            order.cancelReason = cancelReason || 'Khách hàng yêu cầu hủy đơn';
            order.cancellationInfo.requestedBy = userId;
            await order.save();

            return res.json({
                success: true,
                order,
                message: 'Đã gửi yêu cầu hủy đơn. Shop sẽ xem xét và phản hồi sớm nhất.'
            });
        }

        // Cannot cancel
        return res.status(400).json({
            success: false,
            message: 'Không thể hủy đơn hàng ở trạng thái hiện tại'
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ GET ORDER STATUS HISTORY
export const getOrderStatusHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, userId });
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            statusHistory: order.statusHistory,
            currentStatus: order.status
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ ADMIN: Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, note } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        await order.updateStatus(status, note, 'admin');

        // ✅ SEND NOTIFICATION TO USER

        const notificationMap = {
            'confirmed': {
                title: 'Đơn hàng đã được xác nhận',
                message: `Đơn hàng #${order.orderCode} đã được xác nhận và sẽ được chuẩn bị trong thời gian sớm nhất.`,
                type: 'order_confirmed'
            },
            'preparing': {
                title: 'Đơn hàng đang được chuẩn bị',
                message: `Đơn hàng #${order.orderCode} đang được chuẩn bị. Shop sẽ giao hàng cho bạn trong thời gian sớm nhất.`,
                type: 'order_preparing'
            },
            'shipping': {
                title: 'Đơn hàng đang được giao',
                message: `Đơn hàng #${order.orderCode} của bạn đang trên đường giao đến. Vui lòng để ý điện thoại.`,
                type: 'order_shipping'
            },
            'completed': {
                title: 'Đơn hàng đã giao thành công',
                message: `Đơn hàng #${order.orderCode} đã được giao thành công. Cảm ơn bạn đã mua hàng! Hãy đánh giá sản phẩm để nhận điểm thưởng nhé.`,
                type: 'order_completed'
            },
            'cancelled': {
                title: 'Đơn hàng đã bị hủy',
                message: `Đơn hàng #${order.orderCode} đã bị hủy. ${note || ''}`,
                type: 'order_cancelled'
            }
        };

        if (notificationMap[status]) {
            const { title, message, type } = notificationMap[status];
            try {
                await notificationService.createNotification({
                    userId: order.userId,
                    type,
                    title,
                    message,
                    link: `/orders`
                });
            } catch (err) {
                console.error('Failed to create notification:', err);
            }
        }

        // ✅ SEND EMAIL for confirmed and completed orders
        const orderWithUser = await Order.findById(order._id).populate('userId');
        if (orderWithUser && orderWithUser.userId && orderWithUser.userId.email) {
            const userEmail = orderWithUser.userId.email;

            if (status === 'confirmed') {
                try {
                    await emailService.sendOrderConfirmationEmail(userEmail, {
                        orderCode: order.orderCode,
                        totalPrice: order.totalPrice,
                        items: order.items
                    });
                } catch (err) {
                    console.error('Failed to send confirmation email:', err);
                }
            } else if (status === 'completed') {
                try {
                    await emailService.sendOrderCompletedEmail(userEmail, {
                        orderCode: order.orderCode,
                        totalPrice: order.totalPrice,
                        items: order.items
                    });
                } catch (err) {
                    console.error('Failed to send completed email:', err);
                }
            }
        }

        res.json({
            success: true,
            order,
            message: 'Cập nhật trạng thái đơn hàng thành công'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ ADMIN: Approve/Reject cancel request
export const handleCancelRequest = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        if (order.status !== 'cancel_requested') {
            return res.status(400).json({
                success: false,
                message: 'Đơn hàng không có yêu cầu hủy'
            });
        }

        if (action === 'approve') {
            // Restore stock
            for (const item of order.items) {
                const product = await Product.findById(item.productId);
                if (product) {
                    product.stock += item.quantity;
                    product.sold -= item.quantity;
                    await product.save();

                    // Real-time stock update
                    try {
                        getIO().emit('product_updated', product);
                    } catch (e) {
                        console.error('Socket emit error:', e);
                    }
                }
            }

            await order.updateStatus('cancelled', 'Yêu cầu hủy được chấp thuận', 'admin');
            order.cancellationInfo.approvedBy = req.user.id;

            return res.json({
                success: true,
                order,
                message: 'Đã chấp thuận yêu cầu hủy đơn'
            });
        }

        if (action === 'reject') {
            await order.updateStatus(
                'preparing',
                `Từ chối yêu cầu hủy: ${rejectionReason} `,
                'admin'
            );
            order.cancellationInfo.rejectionReason = rejectionReason;

            return res.json({
                success: true,
                order,
                message: 'Đã từ chối yêu cầu hủy đơn'
            });
        }

        return res.status(400).json({
            success: false,
            message: 'Action không hợp lệ'
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ GET ORDER STATISTICS
export const getOrderStatistics = async (req, res) => {
    try {
        const userId = req.user.id;

        const stats = await Order.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalPrice' }
                }
            }
        ]);

        res.json({ success: true, stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
