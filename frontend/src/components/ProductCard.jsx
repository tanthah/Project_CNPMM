import React from 'react'
import { Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

export default function ProductCard({ product }) {
    const navigate = useNavigate()

    const handleClick = () => {
        navigate(`/product/${product._id}`)
    }

    // Get first image or placeholder
    const imageUrl = product.images && product.images.length > 0
        ? product.images[0]
        : '/placeholder-product.jpg'

    return (
        <Card className="product-card h-100 shadow-sm" onClick={handleClick}>
            <div className="product-image-wrapper">
                <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                />
                {product.discount > 0 && (
                    <div className="discount-badge">
                        -{product.discount}%
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="out-of-stock-overlay">
                        <span>Hết hàng</span>
                    </div>
                )}
            </div>

            <Card.Body className="d-flex flex-column">
                <Card.Title className="product-name" title={product.name}>
                    {product.name}
                </Card.Title>

                {product.categoryId && (
                    <div className="product-category mb-2">
                        <i className="bi bi-tag me-1"></i>
                        <span className="text-muted small">{product.categoryId.name}</span>
                    </div>
                )}

                <div className="mt-auto">
                    <div className="price-section">
                        {product.discount > 0 && product.finalPrice < product.price && (
                            <div className="original-price text-muted text-decoration-line-through small">
                                {product.price.toLocaleString('vi-VN')}đ
                            </div>
                        )}
                        <div className="final-price" style={{ color: '#f01c00ff', fontSize: '1.25rem', fontWeight: '700' }}>
                            {(product.finalPrice || product.price).toLocaleString('vi-VN')}đ
                        </div>
                    </div>

                    <div className="product-stats d-flex justify-content-between mt-2 small text-muted">
                        <span>
                            <i className="bi bi-eye me-1"></i>
                            {product.views || 0}
                        </span>
                        <span>
                            <i className="bi bi-cart-check me-1"></i>
                            Đã bán {product.soldCount || 0}
                        </span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
