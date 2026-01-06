import Setting from '../models/settingModel.js';

export const getSettings = async (req, res) => {
    try {
        let settings = await Setting.findOne({ key: 'global' });
        if (!settings) {
            // Tạo cấu hình mặc định nếu chưa có (nên được xử lý bởi Admin, nhưng đây là phương án dự phòng tốt)
            settings = await Setting.create({ key: 'global' });
        }
        res.status(200).json({ success: true, data: settings });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ success: false, message: 'Server error fetching settings' });
    }
};
