// backend/src/utils/orderCronJobs.js
import cron from 'node-cron';
import Order from '../models/Order.js';

// ✅ AUTO-CONFIRM ORDERS AFTER 30 MINUTES
// Runs every 5 minutes
export const startOrderCronJobs = () => {
    // Auto-confirm orders every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        try {
            console.log('🔄 Running auto-confirm cron job...');
            const count = await Order.autoConfirmOrders();
            if (count > 0) {
                console.log(`✅ Auto-confirmed ${count} orders`);
            }
        } catch (err) {
            console.error('❌ Error in auto-confirm cron:', err);
        }
    });

    console.log('✅ Order cron jobs started');
};

// Alternative: Use setInterval if cron is not available
export const startOrderAutoConfirm = () => {
    // Check every 5 minutes (300000ms)
    setInterval(async () => {
        try {
            console.log('🔄 Running auto-confirm check...');
            const count = await Order.autoConfirmOrders();
            if (count > 0) {
                console.log(`✅ Auto-confirmed ${count} orders`);
            }
        } catch (err) {
            console.error('❌ Error in auto-confirm:', err);
        }
    }, 5 * 60 * 1000); // 5 minutes

    console.log('✅ Order auto-confirm started (5 min interval)');
};