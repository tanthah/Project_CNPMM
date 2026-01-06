
import cron from 'node-cron';
import Order from '../models/Order.js';

//  TỰ ĐỘNG XÁC NHẬN ĐƠN HÀNG SAU 30 PHÚT
// Chạy mỗi 5 phút
export const startOrderCronJobs = () => {
    // Tự động xác nhận đơn hàng mỗi 5 phút
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log(' Running auto-confirm cron job...');
            const count = await Order.autoConfirmOrders();
            if (count > 0) {
                console.log(` Auto-confirmed ${count} orders`);
            }
        } catch (err) {
            console.error(' Error in auto-confirm cron:', err);
        }
    });

    console.log(' Order cron jobs started');
};

// Thay thế: Sử dụng setInterval nếu không có cron
export const startOrderAutoConfirm = () => {
    // Kiểm tra mỗi 5 phút (300000ms)
    setInterval(async () => {
        try {
            console.log(' Running auto-confirm check...');
            const count = await Order.autoConfirmOrders();
            if (count > 0) {
                console.log(` Auto-confirmed ${count} orders`);
            }
        } catch (err) {
            console.error(' Error in auto-confirm:', err);
        }
    }, 5 * 60 * 1000); // 5 phút

    console.log('Order auto-confirm started (5 min interval)');
};