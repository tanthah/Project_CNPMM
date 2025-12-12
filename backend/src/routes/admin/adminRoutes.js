// backend/src/routes/adminRoutes.js
import express from 'express';
import fileUpload from 'express-fileupload';
import os from 'os';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { authorize } from '../../middleware/authorization.js';

// Product controllers
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus
} from '../../controllers/admin/adminProductController.js';

// Category controllers
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../../controllers/admin/adminCategoryController.js';
// Admin Orders controllers
import {
  getAllOrdersAdmin,
  getOrderDetailAdmin,
  updateOrderStatusAdmin,
  handleCancelRequestAdmin
} from '../../controllers/admin/adminOrderController.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(authenticateToken);
router.use(authorize('admin'));

// Configure file upload (Windows-safe tmp directory)
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  abortOnLimit: true
}));

// ========================================
// PRODUCT ROUTES
// ========================================
router.get('/products', getAllProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.patch('/products/:id/toggle-status', toggleProductStatus);

// ========================================
// CATEGORY ROUTES
// ========================================
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategory);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);
router.patch('/categories/:id/toggle-status', toggleCategoryStatus);

// ========================================
// ORDER ROUTES (ADMIN)
// ========================================
router.get('/orders', getAllOrdersAdmin);
router.get('/orders/:id', getOrderDetailAdmin);
router.put('/orders/:id/status', updateOrderStatusAdmin);
router.put('/orders/:id/cancel-request', handleCancelRequestAdmin);

export default router;
