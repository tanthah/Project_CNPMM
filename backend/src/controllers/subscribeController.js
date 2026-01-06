import { EmailSubscriber } from '../models/EmailSubscriber.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

export const subscribe = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email' });
        }

        // 1. Kiểm tra xem email đã tồn tại chưa
        const existingSubscriber = await EmailSubscriber.findOne({ email: email.toLowerCase() });

        if (existingSubscriber) {
            return res.status(400).json({
                success: false,
                message: 'Email này đã đăng ký nhận tin rồi!'
            });
        }

        // 2. Lưu Subscriber
        await EmailSubscriber.create({
            email: email.toLowerCase(),
            isSubscribed: true
        });

        // 3. Cập nhật User nếu tồn tại
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            user.receivePromotions = true;
            await user.save();
        }

        // 3. Gửi Email
        const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #4A90E2; text-align: center;">🎉 Đăng ký nhận tin thành công!</h2>
        <p>Cảm ơn bạn đã quan tâm đến <strong>TV Shop</strong>.</p>
        <p>Bạn đã đăng ký thành công vào danh sách nhận tin của chúng tôi.</p>
        <p>Chúng tôi sẽ gửi đến bạn những ưu đãi mới nhất, mã giảm giá và thông tin sản phẩm hot nhất trong thời gian sớm nhất.</p>
        
        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background-color: #4A90E2; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Khám phá cửa hàng ngay</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #999; text-align: center;">Nếu bạn muốn hủy đăng ký, vui lòng liên hệ với chúng tôi.</p>
      </div>
    `;

        await sendEmail({
            to: email,
            subject: '🎉 Chào mừng bạn đến với TV Shop',
            html: emailContent
        });

        res.json({ success: true, message: 'Đăng ký thành công! Cảm ơn bạn đã quan tâm.' });

    } catch (error) {
        console.error('Subscribe Error:', error);
        res.status(500).json({ success: false, message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
    }
};
