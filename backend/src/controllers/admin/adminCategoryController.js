// backend/src/controllers/adminCategoryController.js
import Category from '../../models/Category.js';
import Product from '../../models/Product.js';
import { cloudinary, deleteFromCloudinary, extractPublicId } from '../../utils/cloudinary.js';

// Get all categories for admin
export const getAllCategories = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const total = await Category.countDocuments();
    const categories = await Category.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      categories,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get category detail
export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    // Count products in this category
    const productCount = await Product.countDocuments({ categoryId: category._id });

    res.json({
      success: true,
      category: {
        ...category.toObject(),
        productCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create category
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body;

    // Check if slug exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
    }

    // Upload image to Cloudinary if provided
    let image = '';
    if (req.files && req.files.image) {
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'UTE_Shop/categories'
      });
      image = result.secure_url;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isActive: isActive === 'true'
    });

    res.status(201).json({
      success: true,
      category,
      message: 'Thêm danh mục thành công'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    // Check slug uniqueness (except current category)
    if (slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug, _id: { $ne: id } });
      if (existingCategory) {
        return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
      }
    }

    // Handle image update
    let image = category.image;
    if (req.files && req.files.image) {
      // Delete old image
      if (category.image) {
        const publicId = extractPublicId(category.image);
        if (publicId) {
          await deleteFromCloudinary(publicId);
        }
      }

      // Upload new image
      const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: 'UTE_Shop/categories'
      });
      image = result.secure_url;
    }

    // Update category
    category.name = name;
    category.slug = slug;
    category.description = description;
    category.image = image;
    category.isActive = isActive === 'true';

    await category.save();

    res.json({
      success: true,
      category,
      message: 'Cập nhật danh mục thành công'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: category._id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục này vì còn ${productCount} sản phẩm`
      });
    }

    // Delete image from Cloudinary
    if (category.image) {
      const publicId = extractPublicId(category.image);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Xóa danh mục thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle category status
export const toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục' });
    }

    category.isActive = !category.isActive;
    await category.save();

    if (!category.isActive) {
      await Product.updateMany({ categoryId: category._id, isActive: true }, { isActive: false });
    }

    res.json({
      success: true,
      category,
      message: `${category.isActive ? 'Hiển thị' : 'Ẩn'} danh mục thành công`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
