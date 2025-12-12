// backend/src/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// 1. Config Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Config Multer Storage cho Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "UTE_Shop/avatars",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
    public_id: (req, file) => {
      // Tạo unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `avatar-${req.user?.id || 'unknown'}-${uniqueSuffix}`;
    },
  },
});

// 3. Tạo middleware upload
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// 4. Function helper để xóa ảnh cũ trên Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return;
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Deleted from Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// 5. Function helper để extract public_id từ URL
const extractPublicId = (url) => {
  if (!url) return null;
  // URL format: https://res.cloudinary.com/xxx/image/upload/v123456/folder/filename.jpg
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

export { 
  cloudinary, 
  storage, 
  upload, 
  deleteFromCloudinary,
  extractPublicId 
};

export default upload;