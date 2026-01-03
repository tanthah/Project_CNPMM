// backend/src/controllers/wishlistController.js - ENHANCED WITH BATCH CHECK
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// ✅ GET USER WISHLIST
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

    // Filter out deleted products
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

// ✅ ADD TO WISHLIST
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

// ✅ REMOVE FROM WISHLIST
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

// ✅ CHECK IF PRODUCT IN WISHLIST
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

// ✅ NEW: CHECK MULTIPLE PRODUCTS (Batch check)
export const checkMultipleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productIds } = req.body; // Array of product IDs

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

// ✅ CLEAR ALL WISHLIST
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
