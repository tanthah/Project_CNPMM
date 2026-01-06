import { ViewedProduct } from '../models/ViewedProduct.js';

// ✅ THEO DÕI LƯỢT XEM SẢN PHẨM
export const trackView = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId) {
      return res.json({ success: true, message: 'Guest view tracked' });
    }

    await ViewedProduct.trackView(userId, productId);

    res.json({ success: true, message: 'View tracked' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ LẤY SẢN PHẨM ĐÃ XEM
export const getViewedProducts = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;

    const viewedProducts = await ViewedProduct.find({ userId })
      .sort({ lastViewedAt: -1 })
      .limit(limit)
      .populate({
        path: 'productId',
        select: 'name images price finalPrice discount stock rating numReviews'
      });

    // Lọc bỏ sản phẩm đã xóa
    const products = viewedProducts
      .filter(vp => vp.productId)
      .map(vp => ({
        ...vp.productId.toObject(),
        viewCount: vp.viewCount,
        lastViewedAt: vp.lastViewedAt
      }));

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ XÓA LỊCH SỬ ĐÃ XEM
export const clearViewedHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    await ViewedProduct.deleteMany({ userId });

    res.json({
      success: true,
      message: 'Đã xóa lịch sử xem sản phẩm'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ XÓA MỘT SẢN PHẨM ĐÃ XEM
export const removeViewedProduct = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await ViewedProduct.deleteOne({ userId, productId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy mục đã xem để xóa'
      });
    }

    res.json({
      success: true,
      message: 'Đã xóa sản phẩm khỏi lịch sử đã xem'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
