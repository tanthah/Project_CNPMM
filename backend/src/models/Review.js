import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    rating: {
      type: Number,
      min: [1, "Rating tối thiểu là 1"],
      max: [5, "Rating tối đa là 5"],
      required: [true, "Vui lòng chọn đánh giá"]
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment tối đa 500 ký tự"]
    },

    images: [
      {
        type: String  // URL ảnh review
      }
    ]
  },
  { timestamps: true }
);

// Ràng buộc: 1 user chỉ được review 1 product 1 lần
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
