
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// ✅ LẤY DANH SÁCH YÊU THÍCH CỦA USER
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    let wishlist = await Wishlist.findOne({ userId })
      .populate({
        path: 'products.productId',
        select: 'name images price finalPrice discount stock rating numReviews'
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    // Lọc bỏ sản phẩm đã xóa
    wishlist.products = wishlist.products.filter(p => p.productId);

    res.json({
      success: true,
      wishlist,
      count: wishlist.products.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ THÊM VÀO DANH SÁCH YÊU THÍCH
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, products: [] });
    }

    await wishlist.addProduct(productId);
    await wishlist.populate({
      path: 'products.productId',
      select: 'name images price finalPrice discount stock rating numReviews'
    });

    await product.incrementWishlistCount();

    res.json({
      success: true,
      wishlist,
      message: 'Đã thêm vào danh sách yêu thích'
    });
  } catch (err) {
    if (err.message === 'Sản phẩm đã có trong danh sách yêu thích') {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ XÓA KHỎI DANH SÁCH YÊU THÍCH
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh sách yêu thích'
      });
    }

    await wishlist.removeProduct(productId);
    await wishlist.populate({
      path: 'products.productId',
      select: 'name images price finalPrice discount stock rating numReviews'
    });

    const product = await Product.findById(productId);
    if (product) {
      await product.decrementWishlistCount();
    }

    res.json({
      success: true,
      wishlist,
      message: 'Đã xóa khỏi danh sách yêu thích'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ KIỂM TRA SẢN PHẨM CÓ TRONG DANH SÁCH YÊU THÍCH KHÔNG
export const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.json({ success: true, inWishlist: false });
    }

    const inWishlist = wishlist.hasProduct(productId);

    res.json({ success: true, inWishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ MỚI: KIỂM TRA NHIỀU SẢN PHẨM (Kiểm tra hàng loạt)
export const checkMultipleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds } = req.body; // Mảng các ID sản phẩm

    if (!Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'productIds phải là một mảng'
      });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.json({
        success: true,
        wishlistStatus: productIds.reduce((acc, id) => {
          acc[id] = false;
          return acc;
        }, {})
      });
    }

    const wishlistStatus = productIds.reduce((acc, id) => {
      acc[id] = wishlist.hasProduct(id);
      return acc;
    }, {});

    res.json({
      success: true,
      wishlistStatus
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ XÓA TẤT CẢ DANH SÁCH YÊU THÍCH
export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh sách yêu thích' });
    }

    wishlist.products = [];
    await wishlist.save();

    await wishlist.populate({
      path: 'products.productId',
      select: 'name images price finalPrice discount stock rating numReviews'
    });

    res.json({ success: true, wishlist, message: 'Đã xóa toàn bộ danh sách yêu thích' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
