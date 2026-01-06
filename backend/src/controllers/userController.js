
import User from '../models/User.js';
import Order from '../models/Order.js';
import { deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

// Lấy hồ sơ người dùng
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tìm thấy'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Cập nhật hồ sơ người dùng
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, dateOfBirth, gender } = req.body;

    // Xác thực các trường bắt buộc
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Tên không được để trống'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Email không được để trống'
      });
    }

    // Kiểm tra xem email đã tồn tại chưa (và không thuộc về user hiện tại)
    const existingUser = await User.findOne({
      email: email,
      _id: { $ne: userId }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email này đã được sử dụng'
      });
    }

    // Xác thực định dạng số điện thoại (tùy chọn)
    if (phone && !/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    // Xác thực giới tính
    const validGenders = ['male', 'female', 'other'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Giới tính không hợp lệ'
      });
    }

    // Cập nhật người dùng
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone || '',
        dateOfBirth: dateOfBirth || null,
        gender: gender || 'other'
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// Upload avatar - Phiên bản Cloudinary
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được tải lên'
      });
    }

    // Lấy user hiện tại để xóa avatar cũ
    const currentUser = await User.findById(userId);

    // Xóa avatar cũ khỏi Cloudinary nếu có
    if (currentUser.avatar) {
      try {
        const publicId = extractPublicId(currentUser.avatar);
        if (publicId) {
          await deleteFromCloudinary(publicId);
          console.log('Old avatar deleted from Cloudinary');
        }
      } catch (err) {
        console.error('Error deleting old avatar:', err);
        // Continue even if deletion fails
      }
    }

    // Cloudinary tự động upload file, URL nằm trong req.file.path
    const avatarUrl = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Tải ảnh lên thành công',
      data: updatedUser,
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// ✅ ADMIN: Lấy tất cả người dùng
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, q, role, status } = req.query;
    const query = {};
    if (role) query.role = role;
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip((page - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: { items: users, total }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Lấy chi tiết người dùng
export const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Thống kê tổng hợp (Chỉ tính các đơn hàng ĐÃ HOÀN THÀNH)
    const stats = await Order.aggregate([
      {
        $match: {
          userId: user._id,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      user: {
        ...user,
        stats: stats[0] || { totalOrders: 0, totalSpent: 0 }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Cập nhật người dùng (Vai trò, Trạng thái)
export const updateUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body; // { role, isActive, ... }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user, message: 'Cập nhật thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Xóa người dùng
export const deleteUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    // Dọn dẹp dữ liệu liên quan (đơn hàng, giỏ hàng) nếu cần? Hiện tại chỉ xóa user.
    res.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ ADMIN: Upload Avatar
export const uploadAvatarAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Không có file' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Xóa cũ
    if (user.avatar) {
      try {
        const publicId = extractPublicId(user.avatar);
        if (publicId) await deleteFromCloudinary(publicId);
      } catch (e) {
        console.error('Error deleting old avatar:', e);
      }
    }

    // Lưu mới
    user.avatar = req.file.path;
    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật avatar thành công',
      avatar: user.avatar
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};