import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
    key: { type: String, unique: true, default: 'global' },
    general: {
        siteName: { type: String, default: 'TV Shop' },
        contactEmail: { type: String, default: '' },
        supportPhone: { type: String, default: '' },
        address: { type: String, default: '' },
        footerDescription: { type: String, default: '' },
        socialLinks: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            youtube: { type: String, default: '' },
            tiktok: { type: String, default: '' }
        },
        maintenanceMode: { type: Boolean, default: false },
        homepageMessage: { type: String, default: '' }
    },
    order: {
        allowGuestCheckout: { type: Boolean, default: false },
        autoConfirm: { type: Boolean, default: false },
        defaultShippingFee: { type: Number, default: 0 }
    },
    notification: {
        enableEmailNotifications: { type: Boolean, default: true },
        enablePushNotifications: { type: Boolean, default: false }
    }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
