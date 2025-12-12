// backend/src/controllers/loyaltyController.js - FIXED
import LoyaltyPoint from '../models/LoyaltyPoint.js';

// ✅ GET USER LOYALTY POINTS
export const getLoyaltyPoints = async (req, res) => {
  try {
    const userId = req.user.id;

    let loyaltyPoints = await LoyaltyPoint.findOne({ userId });
    
    if (!loyaltyPoints) {
      loyaltyPoints = await LoyaltyPoint.create({ userId });
    }

    res.json({ 
      success: true, 
      loyaltyPoints
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ GET POINTS HISTORY
export const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const loyaltyPoints = await LoyaltyPoint.findOne({ userId });
    
    if (!loyaltyPoints) {
      return res.json({ 
        success: true, 
        history: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0
        }
      });
    }

    // Paginate history
    const totalItems = loyaltyPoints.history.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedHistory = loyaltyPoints.history
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(startIndex, endIndex);

    res.json({ 
      success: true, 
      history: paginatedHistory,
      summary: {
        totalPoints: loyaltyPoints.totalPoints,
        availablePoints: loyaltyPoints.availablePoints,
        usedPoints: loyaltyPoints.usedPoints
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};