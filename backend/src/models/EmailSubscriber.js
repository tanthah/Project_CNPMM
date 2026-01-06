import mongoose from "mongoose";

const emailSubscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Email không hợp lệ",
            ],
        },
        isSubscribed: {
            type: Boolean,
            default: true,
        },
        couponCode: {
            type: String,
            default: null, // Mã giảm giá đã được gửi cho user này
        },
    },
    { timestamps: true }
);

export const EmailSubscriber = mongoose.model(
    "EmailSubscriber",
    emailSubscriberSchema
);
