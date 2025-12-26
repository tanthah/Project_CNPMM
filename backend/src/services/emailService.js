import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Tạo transporter để gửi email
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify connection
transporter.verify((error) => {
    if (error) {
        console.error('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// Send order confirmation email
export const sendOrderConfirmationEmail = async (userEmail, orderData) => {
    const { orderCode, totalPrice, items } = orderData;

    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Đơn hàng #${orderCode} đã được xác nhận`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Đơn hàng của bạn đã được xác nhận!</h2>
                <p>Xin chào,</p>
                <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được xác nhận và đang được chuẩn bị.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Chi tiết đơn hàng:</h3>
                    <p><strong>Mã đơn hàng:</strong> ${orderCode}</p>
                    <p><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString('vi-VN')}đ</p>
                    <p><strong>Số lượng sản phẩm:</strong> ${items.length} sản phẩm</p>
                </div>
                
                <p>Chúng tôi sẽ thông báo cho bạn khi đơn hàng được giao.</p>
                <p>Cảm ơn bạn đã mua hàng tại <strong>${process.env.EMAIL_FROM_NAME}</strong>!</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">
                    Email này được gửi tự động, vui lòng không trả lời email này.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Order confirmation email sent to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send confirmation email:', error);
        return { success: false, error };
    }
};

// Send order completed email
export const sendOrderCompletedEmail = async (userEmail, orderData) => {
    const { orderCode, totalPrice, items } = orderData;

    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Đơn hàng #${orderCode} đã giao thành công`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Đơn hàng đã được giao thành công!</h2>
                <p>Xin chào,</p>
                <p>Đơn hàng <strong>#${orderCode}</strong> của bạn đã được giao thành công.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Chi tiết đơn hàng:</h3>
                    <p><strong>Mã đơn hàng:</strong> ${orderCode}</p>
                    <p><strong>Tổng tiền:</strong> ${totalPrice.toLocaleString('vi-VN')}đ</p>
                    <p><strong>Số lượng sản phẩm:</strong> ${items.length} sản phẩm</p>
                </div>
                
                <p>Cảm ơn bạn đã mua hàng! Hy vọng bạn hài lòng với sản phẩm.</p>
                <p><strong>💡 Đừng quên đánh giá sản phẩm để nhận điểm thưởng nhé!</strong></p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                <p style="color: #888; font-size: 12px;">
                    Email này được gửi tự động, vui lòng không trả lời email này.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Order completed email sent to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send completed email:', error);
        return { success: false, error };
    }
};
