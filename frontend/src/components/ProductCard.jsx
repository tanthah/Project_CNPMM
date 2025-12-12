import React from 'react'
import { Card } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import './css/ProductCard.css'

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
        <Card className="product-card h-100 shadow-sm border-0" onClick={handleClick} style={{ fontSize: '0.85rem' }}>
            <div className="product-image-wrapper" style={{ height: '160px' }}>
                <Card.Img
                    variant="top"
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                    style={{ objectFit: 'contain', height: '100%', padding: '0.5rem' }}
                />
                {product.discount > 0 && (
                    <div className="discount-badge" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                        -{product.discount}%
                    </div>
                )}
                {product.stock === 0 && (
                    <div className="out-of-stock-overlay">
                        <span style={{ fontSize: '0.8rem' }}>Hết hàng</span>
                    </div>
                )}
            </div>

            <Card.Body className="d-flex flex-column p-2">
                <Card.Title className="product-name mb-1" title={product.name} style={{ fontSize: '0.9rem', height: '2.4em', overflow: 'hidden' }}>
                    {product.name}
                </Card.Title>

                <div className="mt-auto">
                    <div className="price-section mb-1">
                        {product.discount > 0 && product.finalPrice < product.price && (
                            <div className="original-price text-muted text-decoration-line-through" style={{ fontSize: '0.75rem' }}>
                                {product.price.toLocaleString('vi-VN')}đ
                            </div>
                        )}
                        <div className="final-price text-danger fw-bold" style={{ fontSize: '1rem' }}>
                            {(product.finalPrice || product.price).toLocaleString('vi-VN')}đ
                        </div>
                    </div>

                    <div className="product-stats d-flex justify-content-between align-items-center small text-muted">
                        <span className="d-flex align-items-center text-warning">
                            <i className="bi bi-star-fill me-1" style={{ fontSize: '0.7rem' }}></i>
                            {product.rating || 0}
                        </span>
                        <span style={{ fontSize: '0.75rem' }}>
                            Đã bán {product.sold || 0}
                        </span>
                    </div>
                </div>
            </Card.Body>
        </Card>
    )
}
