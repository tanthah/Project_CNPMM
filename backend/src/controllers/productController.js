import Product from '../models/Product.js'
import Category from '../models/Category.js' // Import để populate hoạt động

// @desc    Get latest products (8 sản phẩm mới nhất)
// @route   GET /api/products/latest
// @access  Public
export const getLatestProducts = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('categoryId', 'name')

        res.json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (err) {
        console.error('Error fetching latest products:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm mới nhất'
        })
    }
}

// @desc    Get best seller products (6 sản phẩm bán chạy nhất)
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ soldCount: -1 })
            .limit(6)
            .populate('categoryId', 'name')

        res.json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (err) {
        console.error('Error fetching best sellers:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm bán chạy'
        })
    }
}

// @desc    Get most viewed products (8 sản phẩm xem nhiều nhất)
// @route   GET /api/products/most-viewed
// @access  Public
export const getMostViewed = async (req, res) => {
    try {
        const products = await Product.find()
            .sort({ views: -1 })
            .limit(8)
            .populate('categoryId', 'name')

        res.json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (err) {
        console.error('Error fetching most viewed products:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm xem nhiều'
        })
    }
}

// @desc    Get top discount products (4 sản phẩm khuyến mãi cao nhất)
// @route   GET /api/products/top-discounts
// @access  Public
export const getTopDiscounts = async (req, res) => {
    try {
        const products = await Product.find({ discount: { $gt: 0 } })
            .sort({ discount: -1 })
            .limit(4)
            .populate('categoryId', 'name')

        res.json({
            success: true,
            count: products.length,
            data: products
        })
    } catch (err) {
        console.error('Error fetching top discounts:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy sản phẩm khuyến mãi'
        })
    }
}

// @desc    Get product by ID (chi tiết sản phẩm)
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findById(id).populate('categoryId', 'name')

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            })
        }

        res.json({
            success: true,
            data: product
        })
    } catch (err) {
        console.error('Error fetching product by ID:', err)

        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'ID sản phẩm không hợp lệ'
            })
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin sản phẩm'
        })
    }
}

// @desc    Increment product view count
// @route   POST /api/products/:id/view
// @access  Public
export const incrementView = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        )

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            })
        }

        res.json({
            success: true,
            message: 'Đã cập nhật lượt xem',
            views: product.views
        })
    } catch (err) {
        console.error('Error incrementing view:', err)

        // Handle invalid ObjectId
        if (err.kind === 'ObjectId') {
            return res.status(404).json({
                success: false,
                message: 'ID sản phẩm không hợp lệ'
            })
        }

        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật lượt xem'
        })
    }
}

// @desc    Create new product (ADMIN)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            slug,
            description,
            price,
            discount,
            stock,
            images,
            categoryId,
            brand
        } = req.body

        // Validation
        if (!name || !price) {
            return res.status(400).json({
                success: false,
                message: 'Tên và giá sản phẩm là bắt buộc'
            })
        }

        // Auto-generate slug nếu không có
        const productSlug = slug || name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()

        // Check slug đã tồn tại chưa
        const existingProduct = await Product.findOne({ slug: productSlug })
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Slug sản phẩm đã tồn tại, vui lòng đổi tên hoặc slug khác'
            })
        }

        // Create product
        const product = await Product.create({
            name,
            slug: productSlug,
            description,
            price,
            discount: discount || 0,
            stock: stock || 0,
            images: images || [],
            categoryId: categoryId || null,
            brand,
            views: 0,
            soldCount: 0
        })

        await product.populate('categoryId', 'name')

        res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: product
        })
    } catch (err) {
        console.error('Error creating product:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo sản phẩm',
            error: err.message
        })
    }
}

// @desc    Update product (ADMIN)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body

        // Nếu update slug, check trùng
        if (updates.slug) {
            const existing = await Product.findOne({
                slug: updates.slug,
                _id: { $ne: id }
            })
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug đã tồn tại'
                })
            }
        }

        const product = await Product.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).populate('categoryId', 'name')

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            })
        }

        res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        })
    } catch (err) {
        console.error('Error updating product:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật sản phẩm',
            error: err.message
        })
    }
}

// @desc    Delete product (ADMIN)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const product = await Product.findByIdAndDelete(id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            })
        }

        res.json({
            success: true,
            message: 'Xóa sản phẩm thành công',
            data: product
        })
    } catch (err) {
        console.error('Error deleting product:', err)
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa sản phẩm',
            error: err.message
        })
    }
}
