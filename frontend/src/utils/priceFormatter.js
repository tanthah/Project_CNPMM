// frontend/src/utils/priceFormatter.js
// Helper functions for price formatting

/**
 * Format price to Vietnamese currency
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

/**
 * Format price to short format (millions)
 * @param {number} price - Price in VND
 * @returns {string} Formatted price string
 */
export const formatPriceShort = (price) => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)}tr`;
  }
  return `${(price / 1000).toFixed(0)}k`;
};

/**
 * Parse price input string to number
 * @param {string} input - Price input string
 * @returns {number} Parsed price
 */
export const parsePriceInput = (input) => {
  const cleaned = input.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

/**
 * Validate price range
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {Object} Validation result
 */
export const validatePriceRange = (min, max) => {
  const errors = [];
  
  if (min < 0) {
    errors.push('Giá tối thiểu không được âm');
  }
  
  if (max < 0) {
    errors.push('Giá tối đa không được âm');
  }
  
  if (min > max) {
    errors.push('Giá tối thiểu phải nhỏ hơn giá tối đa');
  }
  
  if (max > 100000000) {
    errors.push('Giá tối đa không được vượt quá 100 triệu');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get price range presets
 * @returns {Array} Array of price range presets
 */
export const getPriceRangePresets = () => {
  return [
    { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
    { label: '1 - 5 triệu', min: 1000000, max: 5000000 },
    { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { label: '20 - 50 triệu', min: 20000000, max: 50000000 },
    { label: 'Trên 50 triệu', min: 50000000, max: 100000000 },
  ];
};

/**
 * Calculate price step based on range
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {number} Step value
 */
export const calculatePriceStep = (min, max) => {
  const range = max - min;
  
  if (range <= 1000000) return 10000; // 10k
  if (range <= 5000000) return 50000; // 50k
  if (range <= 10000000) return 100000; // 100k
  if (range <= 50000000) return 500000; // 500k
  return 1000000; // 1 triệu
};