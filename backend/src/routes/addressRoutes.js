// backend/src/routes/addressRoutes.js
import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
    getUserAddresses,
    getAddressDetail,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/addressController.js';

const router = express.Router();

// Tất cả routes yêu cầu đăng nhập
router.use(authenticateToken);

router.get('/', getUserAddresses);
router.get('/:addressId', getAddressDetail);
router.post('/create', createAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);
router.put('/:addressId/set-default', setDefaultAddress);

export default router;