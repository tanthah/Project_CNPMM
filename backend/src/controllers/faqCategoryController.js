import FAQCategory from '../models/FAQCategory.js';

// Lấy tất cả danh mục (Công khai/Admin)
export const getAllCategories = async (req, res) => {
    try {
        const categories = await FAQCategory.find({ isActive: true }).sort({ order: 1 });
        res.json({ success: true, categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Tạo danh mục (Admin)
export const createCategory = async (req, res) => {
    try {
        const { name, slug, icon, order, color } = req.body;
        const category = await FAQCategory.create({ name, slug, icon, order, color });
        res.status(201).json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Cập nhật danh mục (Admin)
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await FAQCategory.findByIdAndUpdate(id, req.body, { new: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Xóa danh mục (Admin)
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await FAQCategory.findByIdAndDelete(id);
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
