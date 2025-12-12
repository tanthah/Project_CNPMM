// backend/src/models/ViewedProduct.js
import mongoose from "mongoose";
const viewedProductSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true
    },
    
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product",
      required: true
    },
    
    viewCount: { 
      type: Number, 
      default: 1 
    },
    
    lastViewedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Compound index
viewedProductSchema.index({ userId: 1, productId: 1 }, { unique: true });
viewedProductSchema.index({ userId: 1, lastViewedAt: -1 });

// Static method: Track product view
viewedProductSchema.statics.trackView = async function(userId, productId) {
  const viewed = await this.findOne({ userId, productId });
  
  if (viewed) {
    viewed.viewCount += 1;
    viewed.lastViewedAt = new Date();
    return viewed.save();
  } else {
    return this.create({ userId, productId });
  }
};

export const ViewedProduct = mongoose.model("ViewedProduct", viewedProductSchema);