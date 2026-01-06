
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import { getIO } from "../sockets/socketHandler.js";

// ✅ ENHANCED: LẤY TẤT CẢ SẢN PHẨM VỚI LAZY LOADING VÀ TÌM KIẾM
export const getAllProductsWithPagination = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 16;
        const skip = (page - 1) * limit;
        const sort = req.query.sort || 'newest';
        const search = req.query.search || '';
        const category = req.query.category || '';
        const minPrice = parseFloat(req.query.minPrice) || 0;
        const maxPrice = parseFloat(req.query.maxPrice) || Infinity;

        // Xây dựng truy vấn tìm kiếm
        let searchQuery = { isActive: true };

        // ✅ Lọc theo danh mục
        if (category && category !== 'all') {
            searchQuery.categoryId = category;
        }

        // ✅ Lọc theo khoảng giá
        if (minPrice > 0 || maxPrice < Infinity) {
            searchQuery.finalPrice = {};
            if (minPrice > 0) {
                searchQuery.finalPrice.$gte = minPrice;
            }
            if (maxPrice < Infinity && maxPrice < 100000000) {
                searchQuery.finalPrice.$lte = maxPrice;
            }
        }

        // ✅ Tìm kiếm theo từ khóa
        if (search.trim()) {
            searchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } }
            ];
        }

        // Xây dựng đối tượng sắp xếp
        let sortObj = {};
        switch (sort) {
            case 'newest':
                sortObj = { createdAt: -1 };
                break;
            case 'price-asc':
                sortObj = { finalPrice: 1 };
                break;
            case 'price-desc':
                sortObj = { finalPrice: -1 };
                break;
            case 'best-selling':
                sortObj = { sold: -1 };
                break;
            case 'discount':
                sortObj = { discount: -1 };
                break;
            case 'name-asc':
                sortObj = { name: 1 };
                break;
            case 'name-desc':
                sortObj = { name: -1 };
                break;
            default:
                sortObj = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('categoryId', 'name slug');

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: page,
                totalPages,
                totalProducts,
                productsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            search: search || null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ NEW: TÌM KIẾM SẢN PHẨM NÂNG CAO
export const searchProducts = async (req, res) => {
    try {
        const {
            query = '',
            category,
            minPrice,
            maxPrice,
            brand,
            sort = 'relevance',
            page = 1,
            limit = 16
        } = req.query;

        const skip = (page - 1) * limit;

        // Xây dựng truy vấn tìm kiếm
        let searchQuery = { isActive: true };

        // Tìm kiếm văn bản
        if (query.trim()) {
            searchQuery.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { brand: { $regex: query, $options: 'i' } }
            ];
        }

        // Lọc theo danh mục
        if (category) {
            searchQuery.categoryId = category;
        }

        // Lọc theo khoảng giá
        if (minPrice || maxPrice) {
            searchQuery.finalPrice = {};
            if (minPrice) searchQuery.finalPrice.$gte = parseFloat(minPrice);
            if (maxPrice) searchQuery.finalPrice.$lte = parseFloat(maxPrice);
        }

        // Lọc theo thương hiệu
        if (brand) {
            searchQuery.brand = { $regex: brand, $options: 'i' };
        }

        // Xây dựng sắp xếp
        let sortObj = {};
        switch (sort) {
            case 'relevance':
                // Sắp xếp theo điểm khớp (nếu dùng index văn bản) hoặc mới nhất
                sortObj = { createdAt: -1 };
                break;
            case 'price-asc':
                sortObj = { finalPrice: 1 };
                break;
            case 'price-desc':
                sortObj = { finalPrice: -1 };
                break;
            case 'best-selling':
                sortObj = { sold: -1 };
                break;
            case 'rating':
                sortObj = { rating: -1 };
                break;
            default:
                sortObj = { createdAt: -1 };
        }

        const totalProducts = await Product.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(searchQuery)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .populate('categoryId', 'name slug');

        // Lấy các tùy chọn lọc
        const categories = await Product.distinct('categoryId', { isActive: true });
        const brands = await Product.distinct('brand', { isActive: true });
        const priceRange = await Product.aggregate([
            { $match: { isActive: true } },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: '$finalPrice' },
                    maxPrice: { $max: '$finalPrice' }
                }
            }
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                productsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            filters: {
                categories,
                brands: brands.filter(Boolean),
                priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
            },
            searchQuery: {
                query,
                category,
                minPrice,
                maxPrice,
                brand,
                sort
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const suggestProducts = async (req, res) => {
    try {
        const { query = '', limit = 8 } = req.query;
        if (!query || !query.trim()) {
            return res.json({ success: true, suggestions: [] });
        }

        const q = query.trim();
        const first = q[0];
        const rest = q.slice(1);
        const fuzzyRest = rest.split('').map(ch => `.*${ch}`).join('');
        const pattern = `^${first}${fuzzyRest}`;

        const regex = new RegExp(pattern, 'i');

        const products = await Product.find({
            isActive: true,
            $or: [
                { name: regex },
                { brand: regex }
            ]
        })
            .select('name brand images finalPrice')
            .limit(parseInt(limit));

        const suggestions = products.map(p => ({
            id: p._id,
            name: p.name,
            brand: p.brand,
            image: p.images?.[0] || null,
            price: p.finalPrice
        }));

        res.json({ success: true, suggestions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const fuzzySearchProducts = async (req, res) => {
    try {
        const { query = '', page = 1, limit = 16 } = req.query;
        const skip = (page - 1) * limit;

        if (!query || !query.trim()) {
            return res.json({ success: true, products: [], pagination: { currentPage: 1, totalPages: 0, totalProducts: 0, productsPerPage: limit } });
        }

        const q = query.trim();
        const first = q[0];
        const rest = q.slice(1);
        const fuzzyRest = rest.split('').map(ch => `.*${ch}`).join('');
        const pattern = `^${first}${fuzzyRest}`;
        const regex = new RegExp(pattern, 'i');

        const filter = {
            isActive: true,
            $or: [
                { name: regex },
                { brand: regex },
                { description: regex }
            ]
        };

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('categoryId', 'name slug');

        res.json({
            success: true,
            products,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalProducts,
                productsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            },
            searchQuery: { query }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY TẤT CẢ SẢN PHẨM (Đơn giản - cho mục đích khác)
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT SẢN PHẨM (Tự động tăng lượt xem)
export const getProductDetail = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('categoryId');
        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        product.views += 1;
        await product.save();

        res.json({ success: true, product });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM BÁN CHẠY NHẤT
export const getBestSellingProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ sold: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM MỚI NHẤT
export const getNewestProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM XEM NHIỀU NHẤT
export const getMostViewedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ views: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// SẢN PHẨM GIẢM GIÁ CAO NHẤT
export const getHighestDiscountProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true })
            .sort({ discount: -1 })
            .limit(8)
            .populate('categoryId');
        res.json({ success: true, products });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ADMIN CRUD
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

        // Cập nhật thời gian thực
        try {
            getIO().emit('product_updated', product);
        } catch (e) {
            console.error('Socket emit error:', e);
        }

        res.json({ success: true, product });
    } catch (err) {
        console.error(err);
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        res.json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// ✅ NEW: LẤY SẢN PHẨM TƯƠNG TỰ
export const getSimilarProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 8;

        // Lấy sản phẩm hiện tại
        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Tìm sản phẩm tương tự (cùng danh mục, trừ sản phẩm hiện tại)
        const similarProducts = await Product.find({
            categoryId: currentProduct.categoryId,
            _id: { $ne: id },
            isActive: true
        })
            .sort({ sold: -1, views: -1 }) // Ưu tiên bán chạy nhất
            .limit(limit)
            .populate('categoryId', 'name slug');

        res.json({
            success: true,
            products: similarProducts,
            count: similarProducts.length
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ NEW: THỐNG KÊ SẢN PHẨM (số người mua, số đánh giá)
export const getProductStats = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Đếm số người mua duy nhất (người dùng đã hoàn thành đơn hàng với sản phẩm này)
        const uniqueBuyers = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    'items.productId': product._id
                }
            },
            {
                $group: {
                    _id: '$userId'
                }
            },
            {
                $count: 'count'
            }
        ]);

        const buyerCount = uniqueBuyers.length > 0 ? uniqueBuyers[0].count : 0;

        // Đếm số đánh giá
        const reviewCount = await Review.countDocuments({
            productId: id,
            isHidden: false
        });

        // Đếm số người dùng đã đánh giá
        const uniqueReviewers = await Review.aggregate([
            {
                $match: {
                    productId: product._id,
                    isHidden: false
                }
            },
            {
                $group: {
                    _id: '$userId'
                }
            },
            {
                $count: 'count'
            }
        ]);

        const reviewerCount = uniqueReviewers.length > 0 ? uniqueReviewers[0].count : 0;

        res.json({
            success: true,
            stats: {
                views: product.views || 0,
                sold: product.sold || 0,
                uniqueBuyers: buyerCount,
                reviewCount: reviewCount,
                uniqueReviewers: reviewerCount,
                wishlistCount: product.wishlistCount || 0,
                rating: product.rating || 0,
                numReviews: product.numReviews || 0
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ✅ NÂNG CAO: Lấy chi tiết sản phẩm với thống kê
export const getProductDetailEnhanced = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('categoryId');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sản phẩm"
            });
        }

        // Tăng lượt xem
        product.views += 1;
        await product.save();

        // Lấy thống kê
        const uniqueBuyers = await Order.aggregate([
            {
                $match: {
                    status: 'completed',
                    'items.productId': product._id
                }
            },
            {
                $group: { _id: '$userId' }
            },
            {
                $count: 'count'
            }
        ]);

        const buyerCount = uniqueBuyers.length > 0 ? uniqueBuyers[0].count : 0;

        const reviewCount = await Review.countDocuments({
            productId: product._id,
            isHidden: false
        });

        const uniqueReviewers = await Review.aggregate([
            {
                $match: {
                    productId: product._id,
                    isHidden: false
                }
            },
            {
                $group: { _id: '$userId' }
            },
            {
                $count: 'count'
            }
        ]);

        const reviewerCount = uniqueReviewers.length > 0 ? uniqueReviewers[0].count : 0;

        res.json({
            success: true,
            product: {
                ...product.toObject(),
                stats: {
                    uniqueBuyers: buyerCount,
                    reviewCount: reviewCount,
                    uniqueReviewers: reviewerCount
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
