import Subscriber from '../models/subscriberModel.js';
import User from '../models/User.js';

export const subscribe = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Vui lòng nhập email' });
        }

        // Check if email exists in Users (Registered User)
        const existingUser = await User.findOne({ email });

        // Check if email already subscribed
        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ success: false, message: 'Email này đã đăng ký nhận tin rồi' });
        }

        // Create new subscriber
        // If user exists in User table, mark as registered user, but still save to Subscriber for unified list?
        // User asked to "distinguish between who has account and who just registered for code".
        // So we save them here with a flag.

        await Subscriber.create({
            email,
            isRegisteredUser: !!existingUser
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký nhận tin thành công!'
        });

    } catch (error) {
        next(error);
    }
};
