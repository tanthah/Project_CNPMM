import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            enum: ['shipping', 'payment', 'return', 'loyalty', 'account', 'general'],
            required: true
        },

        question: {
            type: String,
            required: true
        },

        answer: {
            type: String,
            required: true
        },

        icon: {
            type: String,  // Emoji icon
            default: ''
        },

        order: {
            type: Number,  // Thứ tự hiển thị
            default: 0
        },

        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Index để query theo category và order
faqSchema.index({ category: 1, order: 1 });
faqSchema.index({ isActive: 1, order: 1 });

export default mongoose.model("FAQ", faqSchema);
