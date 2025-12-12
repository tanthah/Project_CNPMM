// backend/src/controllers/userController.js
import User from '../models/User.js';
import { deleteFromCloudinary, extractPublicId } from '../utils/cloudinary.js';

// Get user profile
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

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, dateOfBirth, gender } = req.body;

    // Validate required fields
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

    // Check if email already exists (and not belonging to current user)
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

    // Validate phone format (optional)
    if (phone && !/^\d{10,11}$/.test(phone.replace(/\D/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Số điện thoại không hợp lệ'
      });
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (gender && !validGenders.includes(gender)) {
      return res.status(400).json({
        success: false,
        message: 'Giới tính không hợp lệ'
      });
    }

    // Update user
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

// Upload avatar - Cloudinary version
export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được tải lên'
      });
    }

    // Get current user to delete old avatar
    const currentUser = await User.findById(userId);
    
    // Delete old avatar from Cloudinary if exists
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

    // Cloudinary automatically uploads the file, URL is in req.file.path
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