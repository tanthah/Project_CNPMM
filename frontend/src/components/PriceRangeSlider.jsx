// frontend/src/components/PriceRangeSlider.jsx
import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import './css/PriceRangeSlider.css';

export default function PriceRangeSlider({ 
  min = 0, 
  max = 100000000,
  currentMin = 0,
  currentMax = 100000000,
  onChange,
  onApply 
}) {
  const [minValue, setMinValue] = useState(currentMin);
  const [maxValue, setMaxValue] = useState(currentMax);

  useEffect(() => {
    setMinValue(currentMin);
    setMaxValue(currentMax);
  }, [currentMin, currentMax]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    const newMin = Math.min(value, maxValue - 100000);
    setMinValue(newMin);
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    const newMax = Math.max(value, minValue + 100000);
    setMaxValue(newMax);
  };

  const handleMinInputChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setMinValue(Math.max(min, Math.min(value, maxValue)));
  };

  const handleMaxInputChange = (e) => {
    const value = parseInt(e.target.value) || max;
    setMaxValue(Math.min(max, Math.max(value, minValue)));
  };

  const handleApply = () => {
    if (onApply) {
      onApply(minValue, maxValue);
    }
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}tr`;
    }
    return `${(price / 1000).toFixed(0)}k`;
  };

  const formatInputPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const handleInputBlur = (type) => {
    if (type === 'min' && minValue > maxValue) {
      setMinValue(maxValue - 100000);
    }
    if (type === 'max' && maxValue < minValue) {
      setMaxValue(minValue + 100000);
    }
  };

  // Calculate percentage for slider track
  const minPercent = ((minValue - min) / (max - min)) * 100;
  const maxPercent = ((maxValue - min) / (max - min)) * 100;

  return (
    <div className="price-range-slider">
      {/* Price Input Fields */}
      <div className="price-inputs">
        <div className="price-input-group">
          <label className="small text-muted mb-1">Từ</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={formatInputPrice(minValue)}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              handleMinInputChange({ target: { value } });
            }}
            onBlur={() => handleInputBlur('min')}
          />
        </div>
        <div className="price-separator">—</div>
        <div className="price-input-group">
          <label className="small text-muted mb-1">Đến</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={formatInputPrice(maxValue)}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              handleMaxInputChange({ target: { value } });
            }}
            onBlur={() => handleInputBlur('max')}
          />
        </div>
      </div>

      {/* Range Sliders */}
      <div className="slider-container">
        <div 
          className="slider-track"
          style={{
            background: `linear-gradient(to right, 
              #e9ecef 0%, 
              #e9ecef ${minPercent}%, 
              #667eea ${minPercent}%, 
              #667eea ${maxPercent}%, 
              #e9ecef ${maxPercent}%, 
              #e9ecef 100%)`
          }}
        ></div>
        
        <input
          type="range"
          className="slider slider-min"
          min={min}
          max={max}
          step="100000"
          value={minValue}
          onChange={handleMinChange}
        />
        
        <input
          type="range"
          className="slider slider-max"
          min={min}
          max={max}
          step="100000"
          value={maxValue}
          onChange={handleMaxChange}
        />
      </div>

      {/* Price Labels */}
      <div className="price-labels">
        <span className="price-label">{formatPrice(minValue)}</span>
        <span className="price-label">{formatPrice(maxValue)}</span>
      </div>

      {/* Quick Presets */}
      <div className="price-presets">
        <button 
          className="preset-btn"
          onClick={() => { setMinValue(0); setMaxValue(1000000); }}
        >
          &lt; 1tr
        </button>
        <button 
          className="preset-btn"
          onClick={() => { setMinValue(1000000); setMaxValue(5000000); }}
        >
          1-5tr
        </button>
        <button 
          className="preset-btn"
          onClick={() => { setMinValue(5000000); setMaxValue(10000000); }}
        >
          5-10tr
        </button>
        <button 
          className="preset-btn"
          onClick={() => { setMinValue(10000000); setMaxValue(100000000); }}
        >
          &gt; 10tr
        </button>
      </div>

      {/* Apply Button */}
      <Button 
        variant="primary" 
        size="sm" 
        className="w-100 apply-btn"
        onClick={handleApply}
      >
        <i className="bi bi-check-circle me-2"></i>
        Áp dụng
      </Button>
    </div>
  );
}