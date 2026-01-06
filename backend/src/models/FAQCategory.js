import mongoose from "mongoose";

const faqCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        icon: {
            type: String,
            default: '❓'
        },
        order: {
            type: Number,
            default: 0
        },
        color: {
            type: String,
            default: 'bg-gray-800 text-gray-300 border-gray-700'
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export default mongoose.model("FAQCategory", faqCategorySchema);
