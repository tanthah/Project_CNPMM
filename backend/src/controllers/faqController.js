// backend/src/controllers/faqController.js
import FAQ from '../models/FAQ.js';

/**
 * GET /api/faqs
 * Lấy tất cả FAQs (public)
 */
export const getAllFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find({ isActive: true })
            .sort({ order: 1 })
            .select('-__v');

        // Group by category
        const groupedFAQs = faqs.reduce((acc, faq) => {
            const category = faq.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(faq);
            return acc;
        }, {});

        res.json({
            success: true,
            faqs: groupedFAQs,
            total: faqs.length
        });
    } catch (error) {
        console.error('Error in getAllFAQs:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách câu hỏi'
        });
    }
};

/**
 * GET /api/faqs/:id
 * Lấy chi tiết 1 FAQ
 */
export const getFAQById = async (req, res) => {
    try {
        const { id } = req.params;
        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        res.json({
            success: true,
            faq
        });
    } catch (error) {
        console.error('Error in getFAQById:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy câu hỏi'
        });
    }
};

/**
 * POST /api/faqs (Admin only)
 * Tạo FAQ mới
 */
export const createFAQ = async (req, res) => {
    try {
        const { category, question, answer, icon, order } = req.body;

        const faq = await FAQ.create({
            category,
            question,
            answer,
            icon,
            order
        });

        res.status(201).json({
            success: true,
            faq,
            message: 'Tạo câu hỏi thành công'
        });
    } catch (error) {
        console.error('Error in createFAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo câu hỏi'
        });
    }
};

/**
 * PUT /api/faqs/:id (Admin only)
 * Cập nhật FAQ
 */
export const updateFAQ = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, question, answer, icon, order, isActive } = req.body;

        const faq = await FAQ.findByIdAndUpdate(
            id,
            { category, question, answer, icon, order, isActive },
            { new: true, runValidators: true }
        );

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        res.json({
            success: true,
            faq,
            message: 'Cập nhật thành công'
        });
    } catch (error) {
        console.error('Error in updateFAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật'
        });
    }
};

/**
 * DELETE /api/faqs/:id (Admin only)
 * Xóa FAQ
 */
export const deleteFAQ = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy câu hỏi'
            });
        }

        res.json({
            success: true,
            message: 'Xóa câu hỏi thành công'
        });
    } catch (error) {
        console.error('Error in deleteFAQ:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa câu hỏi'
        });
    }
};
