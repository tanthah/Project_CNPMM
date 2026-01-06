
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/authorization.js';
import {
    createOrder,
    getUserOrders,
    getOrderDetail,
    cancelOrder,
    getOrderStatusHistory,
    updateOrderStatus,
    handleCancelRequest,
    getOrderStatistics,
    getAllOrders,
    getAdminOrderDetail,
    updateOrderNote,
    deleteOrder // Import added
} from '../controllers/orderController.js';

const router = express.Router();

// ✅ ROUTE KHÁCH HÀNG
router.use(authenticateToken);

// Tạo đơn hàng
router.post('/create', createOrder);

// ✅ ADMIN: Lấy tất cả đơn hàng (Phải đặt trước /:id hoặc /)
router.get('/admin/list', authorize('admin'), getAllOrders);
router.get('/admin/detail/:orderId', authorize('admin'), getAdminOrderDetail);
router.put('/admin/note/:orderId', authorize('admin'), updateOrderNote);
router.delete('/admin/delete/:orderId', authorize('admin'), deleteOrder);

// Lấy đơn hàng của user (với bộ lọc trạng thái tùy chọn)
// Ví dụ: /orders?status=new
router.get('/', getUserOrders);

// Lấy thống kê đơn hàng
router.get('/statistics', getOrderStatistics);

// Lấy chi tiết đơn hàng
router.get('/:orderId', getOrderDetail);

// Lấy lịch sử trạng thái đơn hàng
router.get('/:orderId/history', getOrderStatusHistory);

// Hủy đơn hàng
router.put('/:orderId/cancel', cancelOrder);

// ✅ ROUTE ADMIN
router.use(authorize('admin'));

// Cập nhật trạng thái đơn hàng
router.put('/:orderId/status', updateOrderStatus);

// Xử lý yêu cầu hủy
router.put('/:orderId/cancel-request', handleCancelRequest);

export default router;