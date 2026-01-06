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

// Gửi email chào mừng người đăng ký mới với mã giảm giá và điểm thưởng
export const sendWelcomeEmail = async (userEmail, userData) => {
    const { name, couponCode, points } = userData;

    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🎉 Chào mừng bạn đến với ${process.env.EMAIL_FROM_NAME || 'TV Shop'}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Chào mừng bạn!</h1>
                </div>
                
                <!-- Body -->
                <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <p style="font-size: 16px; color: #333;">Xin chào <strong style="color: #667eea;">${name}</strong>,</p>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Cảm ơn bạn đã đăng ký tài khoản tại <strong>${process.env.EMAIL_FROM_NAME || 'TV Shop'}</strong>! 
                        Chúng tôi rất vui được chào đón bạn vào cộng đồng của chúng tôi.
                    </p>
                    
                    <!-- Quà tặng chào mừng -->
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 25px; border-radius: 12px; margin: 25px 0; text-align: center;">
                        <h2 style="color: #fff; margin: 0 0 15px 0; font-size: 20px;">🎁 QUÀ TẶNG CHÀO MỪNG</h2>
                        
                        <!-- Mã giảm giá -->
                        <div style="background-color: rgba(255,255,255,0.95); padding: 20px; border-radius: 8px; margin-bottom: 15px;">
                            <p style="margin: 0 0 10px 0; color: #333; font-size: 14px;">Mã giảm giá 10% cho đơn hàng đầu tiên:</p>
                            <div style="background-color: #667eea; color: #fff; font-size: 24px; font-weight: bold; letter-spacing: 3px; padding: 15px 25px; border-radius: 8px; display: inline-block;">
                                ${couponCode}
                            </div>
                        </div>
                        
                        <!-- Điểm thưởng -->
                        <div style="background-color: rgba(255,255,255,0.95); padding: 15px; border-radius: 8px;">
                            <p style="margin: 0; color: #333; font-size: 14px;">
                                ✨ Bạn đã được tặng <strong style="color: #f5576c; font-size: 18px;">${points} điểm thưởng</strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Hướng dẫn -->
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin: 0 0 15px 0; font-size: 16px;">📌 Lưu ý:</h3>
                        <ul style="color: #666; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                            <li>Mã giảm giá có hiệu lực trong <strong>30 ngày</strong></li>
                            <li>Áp dụng cho mọi đơn hàng, không giới hạn giá trị tối thiểu</li>
                            <li>Điểm thưởng có thể sử dụng để giảm giá các đơn hàng tiếp theo</li>
                        </ul>
                    </div>
                    
                    <p style="font-size: 16px; color: #333; line-height: 1.6;">
                        Hãy bắt đầu khám phá các sản phẩm tuyệt vời của chúng tôi ngay hôm nay!
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" 
                           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 25px; font-size: 16px; font-weight: bold; display: inline-block;">
                            🛍️ Bắt đầu mua sắm
                        </a>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 20px;">
                    <p style="color: #888; font-size: 12px; margin: 0;">
                        Email này được gửi tự động, vui lòng không trả lời email này.
                    </p>
                    <p style="color: #888; font-size: 12px; margin: 10px 0 0 0;">
                        © ${new Date().getFullYear()} ${process.env.EMAIL_FROM_NAME || 'TV Shop'}. All rights reserved.
                    </p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send welcome email:', error);
        return { success: false, error };
    }
};

// Gửi email OTP
export const sendOtpEmail = async (userEmail, otp) => {
    // Re-create transporter at runtime to ensure env vars are loaded
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log('📧 Preparing to send OTP...');
    console.log('   - From:', process.env.EMAIL_USER);
    console.log('   - To:', userEmail);
    // console.log('   - Pass Len:', process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.length : 0);

    const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Mã OTP đăng ký tài khoản',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0d6efd; margin: 0;">Xác thực đăng ký tài khoản</h2>
            </div>
            
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu đăng ký tài khoản tại <strong>${process.env.EMAIL_FROM_NAME || 'TV Shop'}</strong>.</p>
            <p>Đây là mã xác thực (OTP) của bạn:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; border-radius: 8px; margin: 25px 0;">
              <h1 style="color: #0d6efd; font-size: 32px; letter-spacing: 5px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            
            <p>Mã này có hiệu lực trong vòng <strong>10 phút</strong>.</p>
            <p style="color: #6c757d; font-size: 14px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.
            </p>
          </div>
        `
    };

    try {
        await transporter.verify(); // Verify connection first
        await transporter.sendMail(mailOptions);
        console.log('✅ OTP email sent to:', userEmail);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        return { success: false, error: error.message }; // Return error message
    }
};
