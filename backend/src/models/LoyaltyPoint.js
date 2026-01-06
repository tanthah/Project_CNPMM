
import mongoose from "mongoose";

const loyaltyPointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    totalPoints: {
      type: Number,
      default: 0
    },

    availablePoints: {
      type: Number,
      default: 0
    },

    usedPoints: {
      type: Number,
      default: 0
    },

    // Lịch sử điểm
    history: [{
      type: {
        type: String,
        enum: ['earn', 'spend', 'expire', 'admin_adjust'],
        required: true
      },
      points: {
        type: Number,
        required: true
      },
      description: String,
      referenceId: mongoose.Schema.Types.ObjectId,
      referenceType: {
        type: String,
        enum: ['review', 'order', 'coupon', 'admin', 'registration']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Phương thức: Cộng điểm
loyaltyPointSchema.methods.addPoints = function (points, description, referenceId, referenceType) {
  this.totalPoints += points;
  this.availablePoints += points;

  this.history.push({
    type: 'earn',
    points,
    description,
    referenceId,
    referenceType
  });

  return this.save();
};

// Phương thức: Sử dụng điểm
loyaltyPointSchema.methods.spendPoints = function (points, description, referenceId, referenceType) {
  if (this.availablePoints < points) {
    throw new Error('Không đủ điểm để sử dụng');
  }

  this.availablePoints -= points;
  this.usedPoints += points;

  this.history.push({
    type: 'spend',
    points: -points,
    description,
    referenceId,
    referenceType
  });

  return this.save();
};

export default mongoose.model("LoyaltyPoint", loyaltyPointSchema);

