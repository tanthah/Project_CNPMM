

import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import LoyaltyPoint from '../models/LoyaltyPoint.js';

import * as notificationService from '../services/notificationService.js';
import * as emailService from '../services/emailService.js';
import { getIO } from '../sockets/socketHandler.js';
import { applyCouponToOrder } from './couponController.js';

import User from '../models/User.js'; // Added import

// ✅ ADMIN: Lấy tất cả đơn hàng với Lọc & Phân trang
export const getAllOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, search, paymentMethod, startDate, endDate, userId } = req.query;
        const query = {};

        // Lọc theo Trạng thái
        if (status) query.status = status;

        // Lọc theo Phương thức thanh toán
        if (paymentMethod) query.paymentMethod = paymentMethod;

        // Lọc theo ID người dùng cụ thể
        if (userId) query.userId = userId;

        // Lọc theo Khoảng thời gian
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(new Date(endDate).setHours(23, 59, 59, 999));
        }

        // Tìm kiếm theo Mã đơn hàng hoặc Tên khách hàng
        if (search) {
            // Tìm người dùng khớp tên
            const users = await User.find({
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }).select('_id');

            const userIds = users.map(u => u._id);

            query.$or = [
                { orderCode: { $regex: search, $options: 'i' } },
                { userId: { $in: userIds } }
            ];
        }

        const skip = (page - 1) * parseInt(limit);

        const orders = await Order.find(query)
            .populate('userId', 'name email phone avatar')
            .populate('items.productId', 'name price image')
            .populate('addressId')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            data: orders, // Nhất quán với các phản hồi API khác
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



// ✅ ADMIN: Lấy chi tiết đơn hàng
export const getAdminOrderDetail = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findById(orderId)
            .populate('userId', 'name email phone avatar')
            .populate('items.productId', 'name price image')
            .populate('addressId');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            order
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ ADMIN: Cập nhật ghi chú nội bộ
export const updateOrderNote = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { internalNote } = req.body;

        const order = await Order.findByIdAndUpdate(
            orderId,
            { internalNote },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({
            success: true,
            message: 'Đã cập nhật ghi chú nội bộ',
            internalNote: order.internalNote
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ ADMIN: Xóa đơn hàng
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn hàng' });
        }

        res.json({
            success: true,
            message: 'Đã xóa đơn hàng vĩnh viễn'
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ TẠO ĐƠN HÀNG - Cập nhật với lịch sử trạng thái
export const createOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId, notes, shippingFee = 30000, items, couponCode, usedPoints } = req.body;

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

                // Cập nhật kho thời gian thực
                try {
                    getIO().emit('product_updated', product);
                } catch (e) {
                    console.error('Socket emit error:', e);
                }
            }

            // ✅ XÓA CÁC MẶT HÀNG ĐÃ ĐẶT KHỎI GIỎ HÀNG
            const cart = await Cart.findOne({ userId });
            if (cart) {
                const orderedProductIds = orderItems.map(item => item.productId.toString());
                cart.items = cart.items.filter(item => !orderedProductIds.includes(item.productId.toString()));

                // Tính toán lại tổng số
                cart.totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
                cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

                await cart.save();
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

        // ✅ Áp dụng mã giảm giá nếu có
        let couponDiscount = 0;
        let appliedCouponId = null;
        let appliedCouponCode = null;

        if (couponCode) {
            try {
                const couponResult = await applyCouponToOrder(couponCode, userId, totalProductsPrice);
                couponDiscount = couponResult.discount;
                appliedCouponId = couponResult.couponId;
                appliedCouponCode = couponCode.toUpperCase();
            } catch (couponError) {
                return res.status(400).json({
                    success: false,
                    message: couponError.message
                });
            }
        }

        // ✅ Xử lý điểm thưởng (Loyalty Points)
        let pointsDiscount = 0;
        let finalUsedPoints = 0;

        if (usedPoints && usedPoints > 0) {
            let loyaltyWallet = await LoyaltyPoint.findOne({ userId });

            if (!loyaltyWallet) {
                return res.status(400).json({ success: false, message: 'Bạn chưa có ví điểm thưởng' });
            }

            if (loyaltyWallet.availablePoints < usedPoints) {
                return res.status(400).json({ success: false, message: 'Không đủ điểm thưởng để sử dụng' });
            }

            // Quy đổi: 5 điểm = 1.000 VNĐ => 1 điểm = 200 VNĐ
            // User yêu cầu: dùng 20 điểm giảm 4.000 VNĐ => 20 * 200 = 4000
            pointsDiscount = usedPoints * 200;

            // Validate: Không cho dùng điểm > tiền đơn (tổng tiền hàng - coupon)
            const amountBeforePoints = totalProductsPrice - couponDiscount;
            if (pointsDiscount > amountBeforePoints) {
                return res.status(400).json({ success: false, message: 'Điểm sử dụng vượt quá giá trị đơn hàng' });
            }

            finalUsedPoints = usedPoints;

            // Trừ điểm ngay
            await loyaltyWallet.spendPoints(
                finalUsedPoints,
                `Sử dụng cho đơn hàng ${orderCode}`,
                null, // referenceId sẽ update sau khi có orderId hoặc tạm thời null
                'order'
            );
        }

        const totalPrice = totalProductsPrice + shippingFee - couponDiscount - pointsDiscount;

        const order = await Order.create({
            orderCode,
            userId,
            items: orderItems,
            totalPrice,
            shippingFee,
            discount: couponDiscount,
            couponCode: appliedCouponCode,
            couponDiscount,
            couponId: appliedCouponId,
            usedPoints: finalUsedPoints,
            discount: couponDiscount + pointsDiscount, // Tổng giảm giá (coupon + points)
            status: 'new',
            paymentStatus: 'unpaid',
            paymentMethod: 'COD',
            addressId,
            notes
        });

        await order.populate(['items.productId', 'addressId']);

        // ✅ GỬI THÔNG BÁO CHO USER - Đơn hàng đã đặt
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

// ✅ LẤY ĐƠN HÀNG CỦA USER - Với lọc trạng thái
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

// ✅ LẤY CHI TIẾT ĐƠN HÀNG - Với đầy đủ lịch sử trạng thái
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

// ✅ HỦY ĐƠN HÀNG - Nâng cao với logic 30 phút
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

        // Kiểm tra xem đã hủy hoặc hoàn thành chưa
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

        // Kiểm tra xem có thể hủy trực tiếp không (mới hoặc đã xác nhận trong vòng 30 phút)
        if (order.canDirectCancel) {
            // Hủy trực tiếp - Khôi phục kho
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

            // ✅ HOÀN LẠI ĐIỂM NẾU ĐÃ SỬ DỤNG
            if (order.usedPoints > 0) {
                let loyaltyWallet = await LoyaltyPoint.findOne({ userId });
                if (loyaltyWallet) {
                    await loyaltyWallet.addPoints(
                        order.usedPoints,
                        `Hoàn lại điểm do hủy đơn hàng ${order.orderCode}`,
                        order._id,
                        'order'
                    );
                }
            }

            return res.json({
                success: true,
                order,
                message: 'Đã hủy đơn hàng thành công'
            });
        }

        // Nếu đang chuẩn bị - Tạo yêu cầu hủy
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

// ✅ LẤY LỊCH SỬ TRẠNG THÁI ĐƠN HÀNG
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

// ✅ ADMIN: Cập nhật trạng thái đơn hàng
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

        // ✅ LOGIC ĐIỂM THƯỞNG
        if (status === 'completed' && (!order.earnedPoints || order.earnedPoints === 0)) {
            // Tích điểm: 20.000 VNĐ = 1 điểm (tương đương 5% giá trị nếu 1 điểm = 1000đ)
            const pointsToEarn = Math.floor(order.totalPrice / 20000);

            if (pointsToEarn > 0) {
                let loyaltyWallet = await LoyaltyPoint.findOne({ userId: order.userId });
                if (!loyaltyWallet) {
                    loyaltyWallet = await LoyaltyPoint.create({ userId: order.userId });
                }

                await loyaltyWallet.addPoints(
                    pointsToEarn,
                    `Tích điểm từ đơn hàng ${order.orderCode}`,
                    order._id,
                    'order'
                );

                order.earnedPoints = pointsToEarn;
                await order.save();
            }
        } else if (status === 'cancelled') {
            // Hoàn điểm nếu đã dùng
            if (order.usedPoints > 0) {
                let loyaltyWallet = await LoyaltyPoint.findOne({ userId: order.userId });
                if (loyaltyWallet) {
                    await loyaltyWallet.addPoints(
                        order.usedPoints,
                        `Hoàn lại điểm do hủy đơn hàng ${order.orderCode}`,
                        order._id,
                        'order'
                    );
                }
            }
        }

        // ✅ GỬI THÔNG BÁO CHO USER

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

        // ✅ GỬI EMAIL cho đơn hàng đã xác nhận và hoàn thành
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

// ✅ ADMIN: Chấp thuận/Từ chối yêu cầu hủy
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
            // Khôi phục kho
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

            // ✅ HOÀN LẠI ĐIỂM NẾU ĐÃ SỬ DỤNG
            if (order.usedPoints > 0) {
                let loyaltyWallet = await LoyaltyPoint.findOne({ userId: order.userId });
                if (loyaltyWallet) {
                    await loyaltyWallet.addPoints(
                        order.usedPoints,
                        `Hoàn lại điểm do hủy đơn hàng ${order.orderCode}`,
                        order._id,
                        'order'
                    );
                }
            }

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

// ✅ LẤY THỐNG KÊ ĐƠN HÀNG
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
