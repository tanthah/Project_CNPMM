import 'dotenv/config';
import mongoose from 'mongoose';
import FAQ from './src/models/FAQ.js';

const faqs = [
    // Shipping category
    {
        category: 'shipping',
        question: 'Thời gian giao hàng là bao lâu?',
        answer: 'Thời gian giao hàng:\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Nội thành HCM/HN: 1-2 ngày\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Ngoại thành: 3-5 ngày\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Các tỉnh khác: 5-7 ngày\n\n(Lưu ý: Thời gian có thể thay đổi tùy địa điểm và giao hàng nhanh chỉ áp dụng cho một số khu vực)',
        order: 1,
        isActive: true
    },
    {
        category: 'shipping',
        question: 'Khu vực nào được giao hàng?',
        answer: 'Chúng tôi giao hàng toàn quốc, bao gồm:\n<FontAwesomeIcon icon="fa-solid fa-map-marker-alt" /> Tất cả các tỉnh thành Việt Nam\n<FontAwesomeIcon icon="fa-solid fa-truck" /> Các vùng sâu vùng xa (có thể mất thêm 1-2 ngày)\n<FontAwesomeIcon icon="fa-solid fa-money-bill-wave" /> Miễn phí ship cho đơn hàng trên 500,000đ\n<FontAwesomeIcon icon="fa-solid fa-money-bill" /> Phí ship nội thành: 20,000đ - 30,000đ\n<FontAwesomeIcon icon="fa-solid fa-money-bill" /> Phí ship ngoại thành: 30,000đ - 50,000đ',
        order: 2,
        isActive: true
    },

    // Payment category
    {
        category: 'payment',
        question: 'Có những hình thức thanh toán nào?',
        answer: 'Chúng tôi hỗ trợ các hình thức thanh toán:\n<FontAwesomeIcon icon="fa-solid fa-money-bill-wave" /> COD (Thanh toán khi nhận hàng)\n<FontAwesomeIcon icon="fa-solid fa-university" /> Chuyển khoản ngân hàng\n<FontAwesomeIcon icon="fa-solid fa-credit-card" /> Thẻ ATM/Visa/Mastercard\n<FontAwesomeIcon icon="fa-solid fa-mobile-alt" /> Ví điện tử (Momo, ZaloPay, VNPay)\n<FontAwesomeIcon icon="fa-solid fa-credit-card" /> Trả góp qua thẻ tín dụng (cho đơn trên 3 triệu)',
        order: 3,
        isActive: true
    },

    // Return policy
    {
        category: 'return',
        question: 'Chính sách đổi trả như thế nào?',
        answer: 'Chính sách đổi trả:\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Thời gian: Trong vòng 7 ngày kể từ khi nhận hàng\n<FontAwesomeIcon icon="fa-solid fa-exclamation-circle" /> Điều kiện: Sản phẩm chưa qua sử dụng, còn nguyên tem mác\n<FontAwesomeIcon icon="fa-solid fa-undo" /> Hoàn tiền: 100% cho lỗi từ shop, 90% nếu khách đổi ý\n<FontAwesomeIcon icon="fa-solid fa-truck" /> Phí ship đổi trả: Miễn phí nếu lỗi shop, khách chịu nếu đổi ý\n<FontAwesomeIcon icon="fa-solid fa-phone" /> Liên hệ hotline để được hỗ trợ đổi trả',
        order: 4,
        isActive: true
    },
    {
        category: 'return',
        question: 'Chính sách hoàn tiền ra sao?',
        answer: 'Chính sách hoàn tiền:\n<FontAwesomeIcon icon="fa-solid fa-undo" /> Lỗi shop: Hoàn 100% + phí ship\n<FontAwesomeIcon icon="fa-solid fa-undo" /> Khách đổi ý: Hoàn 90% (trừ phí xử lý)\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Thời gian: 3-7 ngày làm việc sau khi nhận hàng hoàn\n<FontAwesomeIcon icon="fa-solid fa-university" /> Phương thức: Chuyển khoản hoặc hoàn về ví\n<FontAwesomeIcon icon="fa-solid fa-exclamation-circle" /> Không hoàn tiền cho sản phẩm đã qua sử dụng',
        order: 5,
        isActive: true
    },

    // Loyalty points
    {
        category: 'loyalty',
        question: 'Làm sao để tích điểm thưởng?',
        answer: 'Cách tích điểm:\n<FontAwesomeIcon icon="fa-solid fa-money-bill" /> Mua hàng: 1% giá trị đơn hàng = điểm (100k = 100 điểm)\n<FontAwesomeIcon icon="fa-solid fa-star" /> Viết review (có ảnh): +50 điểm\n<FontAwesomeIcon icon="fa-solid fa-star" /> Review chất lượng: +100 điểm + coupon 50k\n<FontAwesomeIcon icon="fa-solid fa-user-plus" /> Giới thiệu bạn bè: +200 điểm khi bạn mua hàng\n<FontAwesomeIcon icon="fa-solid fa-gift" /> Sinh nhật: +500 điểm + coupon 100k\n\nĐiểm có thể đổi coupon hoặc giảm giá.',
        order: 6,
        isActive: true
    },
    {
        category: 'loyalty',
        question: 'Cách sử dụng mã giảm giá?',
        answer: 'Hướng dẫn sử dụng mã giảm giá:\n1. Thêm sản phẩm vào giỏ hàng\n2. Tại trang thanh toán, tìm ô "Nhập mã giảm giá"\n3. Nhập mã và bấm "Áp dụng"\n4. Giảm giá sẽ được tính tự động\n\nLưu ý:\n- Mỗi đơn chỉ dùng 1 mã\n- Kiểm tra điều kiện tối thiểu\n- Mã có thời hạn sử dụng',
        order: 7,
        isActive: true
    },

    // Account

    {
        category: 'account',
        question: 'Làm sao để hủy đơn hàng?',
        answer: 'Hủy đơn hàng:\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Đơn "Mới": Tự động hủy trong 30 phút\n<FontAwesomeIcon icon="fa-solid fa-clock" /> Đơn "Đã xác nhận": Tự động hủy trong 30 phút\n<FontAwesomeIcon icon="fa-solid fa-exclamation-circle" /> Đơn "Đang chuẩn bị": Yêu cầu hủy (cần admin duyệt)\n<FontAwesomeIcon icon="fa-solid fa-lock" /> Đơn "Đang giao": Không thể hủy (liên hệ hotline)\n\nCách hủy:\n1. Vào "Đơn hàng của tôi"\n2. Chọn đơn cần hủy\n3. Click "Hủy đơn" hoặc "Yêu cầu hủy"',
        order: 9,
        isActive: true
    },
    {
        category: 'account',
        question: 'Bảo mật thông tin cá nhân?',
        answer: 'Cam kết bảo mật:\n<FontAwesomeIcon icon="fa-solid fa-lock" /> Mã hóa SSL cho tất cả dữ liệu\n<FontAwesomeIcon icon="fa-solid fa-shield-alt" /> Không chia sẻ thông tin với bên thứ 3\n<FontAwesomeIcon icon="fa-solid fa-key" /> Mật khẩu được mã hóa bằng bcrypt\n<FontAwesomeIcon icon="fa-solid fa-credit-card" /> Thanh toán qua cổng bảo mật quốc tế\n<FontAwesomeIcon icon="fa-solid fa-check-circle" /> Tuân thủ Luật An toàn thông tin mạng\n\nBạn có quyền:\n- Xem/Sửa/Xóa thông tin cá nhân\n- Từ chối email marketing',
        order: 10,
        isActive: true
    },
    {
        category: 'general',
        question: 'Chương trình thành viên?',
        answer: 'Chương trình thành viên:\n<FontAwesomeIcon icon="fa-solid fa-star" /> Đồng (0-1M): Tích điểm cơ bản\n<FontAwesomeIcon icon="fa-solid fa-star" /> Bạc (1-5M): +10% điểm, giảm ship 10k\n<FontAwesomeIcon icon="fa-solid fa-star" /> Vàng (5-10M): +20% điểm, giảm ship 20k, ưu tiên hỗ trợ\n<FontAwesomeIcon icon="fa-solid fa-star" /> Kim cương (>10M): +30% điểm, free ship, quà sinh nhật\n\n(Dựa trên tổng giá trị đơn hàng trong 12 tháng)',
        order: 13,
        isActive: true
    },
    {
        category: 'general',
        question: 'Hotline hỗ trợ?',
        answer: 'Liên hệ hỗ trợ:\n<FontAwesomeIcon icon="fa-solid fa-phone" /> Hotline: 1900-xxxx (8h-22h hàng ngày)\n<FontAwesomeIcon icon="fa-solid fa-envelope" /> Email: support@uteshop.com\n<FontAwesomeIcon icon="fa-solid fa-message" /> Chat online: Góc dưới màn hình\n<FontAwesomeIcon icon="fa-solid fa-location-dot" /> Địa chỉ: Số 1 Võ Văn Ngân, TP.HCM\n\nThời gian phản hồi:\n- Hotline: Tức thì\n- Email: Trong 24h\n- Chat: Trong giờ hành chính',
        order: 14,
        isActive: true
    },
];

const seedFAQ = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected\n');

        // Xóa FAQs cũ
        await FAQ.deleteMany({});
        console.log('🗑️ Đã xóa FAQs cũ\n');

        // Tạo FAQs mới
        await FAQ.insertMany(faqs);
        console.log('✅ Đã tạo 15 FAQs mẫu!\n');

        // Thống kê
        const stats = await FAQ.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        console.log('📊 Thống kê theo danh mục:');
        stats.forEach(s => {
            console.log(`   ${s._id}: ${s.count} câu hỏi`);
        });

        console.log('\n✅ Seed FAQ hoàn thành!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
};

seedFAQ();
