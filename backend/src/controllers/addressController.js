// backend/src/controllers/addressController.js
import Address from '../models/Address.js';

// LẤY TẤT CẢ ĐỊA CHỈ CỦA USER
export const getUserAddresses = async (req, res) => {
    try {
        const userId = req.user.id;
        const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
        
        res.json({ success: true, addresses });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// LẤY CHI TIẾT ĐỊA CHỈ
export const getAddressDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        res.json({ success: true, address });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// THÊM ĐỊA CHỈ MỚI
export const createAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName, phone, addressLine, ward, district, city, isDefault } = req.body;

        // Validate
        if (!fullName || !phone || !addressLine || !ward || !district || !city) {
            return res.status(400).json({ 
                success: false, 
                message: 'Vui lòng điền đầy đủ thông tin địa chỉ' 
            });
        }

        // Nếu đặt làm mặc định, bỏ mặc định của địa chỉ cũ
        if (isDefault) {
            await Address.updateMany({ userId }, { isDefault: false });
        }

        // Nếu chưa có địa chỉ nào, tự động đặt làm mặc định
        const existingAddresses = await Address.countDocuments({ userId });
        const shouldBeDefault = existingAddresses === 0 || isDefault;

        const address = await Address.create({
            userId,
            fullName,
            phone,
            addressLine,
            ward,
            district,
            city,
            isDefault: shouldBeDefault
        });

        res.status(201).json({ 
            success: true, 
            address,
            message: 'Đã thêm địa chỉ mới' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// CẬP NHẬT ĐỊA CHỈ
export const updateAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;
        const { fullName, phone, addressLine, ward, district, city, isDefault } = req.body;

        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        // Nếu đặt làm mặc định, bỏ mặc định của địa chỉ khác
        if (isDefault && !address.isDefault) {
            await Address.updateMany({ userId, _id: { $ne: addressId } }, { isDefault: false });
        }

        // Cập nhật
        address.fullName = fullName || address.fullName;
        address.phone = phone || address.phone;
        address.addressLine = addressLine || address.addressLine;
        address.ward = ward || address.ward;
        address.district = district || address.district;
        address.city = city || address.city;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await address.save();

        res.json({ 
            success: true, 
            address,
            message: 'Đã cập nhật địa chỉ' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// XÓA ĐỊA CHỈ
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOneAndDelete({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        // Nếu xóa địa chỉ mặc định, đặt địa chỉ đầu tiên làm mặc định
        if (address.isDefault) {
            const firstAddress = await Address.findOne({ userId }).sort({ createdAt: 1 });
            if (firstAddress) {
                firstAddress.isDefault = true;
                await firstAddress.save();
            }
        }

        res.json({ 
            success: true, 
            message: 'Đã xóa địa chỉ' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ĐẶT ĐỊA CHỈ MẶC ĐỊNH
export const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { addressId } = req.params;

        const address = await Address.findOne({ _id: addressId, userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy địa chỉ' });
        }

        // Bỏ mặc định của địa chỉ khác
        await Address.updateMany({ userId }, { isDefault: false });

        // Đặt địa chỉ này làm mặc định
        address.isDefault = true;
        await address.save();

        res.json({ 
            success: true, 
            address,
            message: 'Đã đặt làm địa chỉ mặc định' 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};