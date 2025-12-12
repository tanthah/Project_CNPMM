// backend/src/controllers/categoryController.js
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// LẤY TẤT CẢ DANH MỤC
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT DANH MỤC
export const getCategoryDetail = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, category });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY SẢN PHẨM THEO DANH MỤC VỚI LAZY LOADING
export const getProductsByCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Kiểm tra category tồn tại
        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }

        // Đếm tổng số sản phẩm trong category
        const totalProducts = await Product.countDocuments({ 
            categoryId: id, 
            isActive: true 
        });

        // Lấy sản phẩm với pagination
        const products = await Product.find({ categoryId: id, isActive: true })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('categoryId', 'name slug');

        const totalPages = Math.ceil(totalProducts / limit);

        res.json({
            success: true,
            products,
            category: {
                _id: category._id,
                name: category.name,
                slug: category.slug,
                description: category.description
            },
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                productsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ADMIN: TẠO DANH MỤC MỚI
export const createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ADMIN: CẬP NHẬT DANH MỤC
export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { 
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, category });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// ADMIN: XÓA DANH MỤC
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
        }
        res.json({ success: true, message: 'Xóa danh mục thành công' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};