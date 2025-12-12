// backend/src/controllers/adminProductController.js
import Product from '../../models/Product.js';
import { cloudinary, deleteFromCloudinary, extractPublicId } from '../../utils/cloudinary.js';

// Get all products for admin (with search & pagination)
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', categoryId, brand } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ]
      };
    }

    if (categoryId) {
      query = { ...query, categoryId };
    }

    if (brand && !search) {
      query = { ...query, brand: { $regex: brand, $options: 'i' } };
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      products,
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

// Get product detail
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create product
export const createProduct = async (req, res) => {
  try {
    const { name, slug, description, price, discount, stock, categoryId, brand, attributes, isActive } = req.body;

    // Check if slug exists
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
    }

    // Upload media to Cloudinary
    const images = [];
    if (req.files && req.files.media) {
      const files = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
      
      for (let file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'UTE_Shop/products',
          resource_type: 'auto' // auto detect image/video
        });
        images.push(result.secure_url);
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock),
      categoryId,
      brand,
      attributes: attributes ? JSON.parse(attributes) : {},
      isActive: isActive === 'true',
      images
    });

    res.status(201).json({
      success: true,
      product,
      message: 'Thêm sản phẩm thành công'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, price, discount, stock, categoryId, brand, attributes, isActive, existingMedia } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Check slug uniqueness (except current product)
    if (slug !== product.slug) {
      const existingProduct = await Product.findOne({ slug, _id: { $ne: id } });
      if (existingProduct) {
        return res.status(400).json({ success: false, message: 'Slug đã tồn tại' });
      }
    }

    // Handle media updates
    let images = [];
    
    // Keep existing media
    if (existingMedia) {
      images = Array.isArray(existingMedia) ? existingMedia : [existingMedia];
    }

    // Upload new media
    if (req.files && req.files.media) {
      const files = Array.isArray(req.files.media) ? req.files.media : [req.files.media];
      
      for (let file of files) {
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: 'UTE_Shop/products',
          resource_type: 'auto'
        });
        images.push(result.secure_url);
      }
    }

    // Delete removed images from Cloudinary
    const removedImages = product.images.filter(img => !images.includes(img));
    for (let img of removedImages) {
      const publicId = extractPublicId(img);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    // Update product
    product.name = name;
    product.slug = slug;
    product.description = description;
    product.price = parseFloat(price);
    product.discount = parseFloat(discount) || 0;
    product.stock = parseInt(stock);
    product.categoryId = categoryId;
    product.brand = brand;
    product.attributes = attributes ? JSON.parse(attributes) : {};
    product.isActive = isActive === 'true';
    product.images = images;

    await product.save();

    res.json({
      success: true,
      product,
      message: 'Cập nhật sản phẩm thành công'
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    // Delete images from Cloudinary
    for (let img of product.images) {
      const publicId = extractPublicId(img);
      if (publicId) {
        await deleteFromCloudinary(publicId);
      }
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Toggle product status
export const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      product,
      message: `${product.isActive ? 'Hiển thị' : 'Ẩn'} sản phẩm thành công`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
