import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Button, Badge, Spinner, Alert } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById } from '../redux/productSlice'
import productApi from '../api/productApi'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import './css/ProductDetail.css'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const { currentProduct, loading, error } = useSelector((s) => s.products)
    const [quantity, setQuantity] = useState(1)
    const [thumbsSwiper, setThumbsSwiper] = useState(null)
    const viewIncrementedRef = useRef(false)

    // Fetch product details
    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id))
        }
    }, [id, dispatch])

    // Increment view count (chỉ gọi 1 lần)
    useEffect(() => {
        if (id && currentProduct && currentProduct._id === id && !viewIncrementedRef.current) {
            console.log('🔵 Tăng lượt xem cho sản phẩm:', id)
            viewIncrementedRef.current = true
            productApi.incrementView(id)
                .then(() => console.log('✅ Đã tăng lượt xem'))
                .catch(err => console.error('❌ Lỗi khi tăng lượt xem:', err))
        }
    }, [id, currentProduct])

    // Reset view increment flag when product changes
    useEffect(() => {
        viewIncrementedRef.current = false
    }, [id])

    const handleIncrease = () => {
        if (currentProduct && quantity < currentProduct.stock) {
            setQuantity(q => q + 1)
        }
    }

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1)
        }
    }

    const handleAddToCart = () => {
        // TODO: Add to cart functionality
        alert(`Thêm ${quantity} sản phẩm vào giỏ hàng!`)
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
            </Container>
        )
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                </Alert>
                <Button variant="primary" onClick={() => navigate('/dashboard')}>
                    <i className="bi bi-house me-2"></i>
                    Về trang chủ
                </Button>
            </Container>
        )
    }

    if (!currentProduct) {
        return (
            <Container className="py-5 text-center">
                <h3>Không tìm thấy sản phẩm</h3>
                <Button variant="primary" onClick={() => navigate('/dashboard')} className="mt-3">
                    <i className="bi bi-house me-2"></i>
                    Về trang chủ
                </Button>
            </Container>
        )
    }

    const product = currentProduct
    const isOutOfStock = product.stock === 0
    const images = product.images && product.images.length > 0
        ? product.images
        : ['/placeholder-product.jpg']

    return (
        <div className="product-detail-page">
            {/* Header */}
            <div className="product-detail-header">
                <Container>
                    <Button
                        variant="link"
                        onClick={() => navigate('/dashboard')}
                        className="back-button"
                    >
                        <i className="bi bi-arrow-left me-2"></i>
                        Quay lại trang chủ
                    </Button>
                </Container>
            </div>

            <Container className="py-4">
                <Row className="g-4">
                    {/* Left Column - Images */}
                    <Col lg={5}>
                        <div className="product-images-section">
                            {/* Main Swiper */}
                            <Swiper
                                modules={[Navigation, Pagination, Thumbs]}
                                navigation
                                pagination={{ clickable: true }}
                                thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                className="main-swiper mb-3"
                                spaceBetween={10}
                            >
                                {images.map((img, idx) => (
                                    <SwiperSlide key={idx}>
                                        <div className="main-image-wrapper">
                                            <img src={img} alt={`${product.name} ${idx + 1}`} />
                                        </div>
                                    </SwiperSlide>
                                ))}
                            </Swiper>

                            {/* Thumbnails Swiper */}
                            {images.length > 1 && (
                                <Swiper
                                    onSwiper={setThumbsSwiper}
                                    spaceBetween={10}
                                    slidesPerView={4}
                                    watchSlidesProgress
                                    className="thumbs-swiper"
                                >
                                    {images.map((img, idx) => (
                                        <SwiperSlide key={idx}>
                                            <div className="thumb-image-wrapper">
                                                <img src={img} alt={`Thumb ${idx + 1}`} />
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            )}
                        </div>
                    </Col>

                    {/* Right Column - Info */}
                    <Col lg={7}>
                        <div className="product-info-section">
                            {/* Product Name */}
                            <h1 className="product-title">{product.name}</h1>

                            {/* Category */}
                            {product.categoryId && (
                                <div className="mb-3">
                                    <Badge bg="secondary" className="category-badge">
                                        <i className="bi bi-tag me-1"></i>
                                        {product.categoryId.name}
                                    </Badge>
                                </div>
                            )}

                            {/* Price Section */}
                            <div className="price-box">
                                {product.discount > 0 && product.price && (
                                    <>
                                        <div className="original-price">
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </div>
                                        <Badge bg="danger" className="discount-badge-detail ms-2">
                                            -{product.discount}%
                                        </Badge>
                                    </>
                                )}
                                <div className="final-price">
                                    {(product.finalPrice || product.price || 0).toLocaleString('vi-VN')}đ
                                </div>
                            </div>

                            {/* Stock Status */}
                            <div className="stock-section my-3">
                                <strong className="me-2">Tình trạng:</strong>
                                {isOutOfStock ? (
                                    <Badge bg="danger">
                                        <i className="bi bi-x-circle me-1"></i>
                                        Hết hàng
                                    </Badge>
                                ) : (
                                    <Badge bg="success">
                                        <i className="bi bi-check-circle me-1"></i>
                                        Còn {product.stock} sản phẩm
                                    </Badge>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="product-stats-detail mb-4">
                                <span className="me-4">
                                    <i className="bi bi-eye text-primary me-2"></i>
                                    <strong>{product.views || 0}</strong> lượt xem
                                </span>
                                <span>
                                    <i className="bi bi-cart-check text-success me-2"></i>
                                    Đã bán <strong>{product.soldCount || 0}</strong>
                                </span>
                            </div>

                            <hr />

                            {/* Quantity Selector */}
                            <div className="quantity-section my-4">
                                <strong className="me-3">Số lượng:</strong>
                                <div className="quantity-controls">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1 || isOutOfStock}
                                    >
                                        <i className="bi bi-dash"></i>
                                    </Button>
                                    <input
                                        type="number"
                                        className="quantity-input"
                                        value={quantity}
                                        readOnly
                                    />
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleIncrease}
                                        disabled={quantity >= product.stock || isOutOfStock}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons d-flex gap-2">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="flex-grow-1"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                >
                                    <i className="bi bi-cart-plus me-2"></i>
                                    {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="lg"
                                    disabled={isOutOfStock}
                                >
                                    <i className="bi bi-heart"></i>
                                </Button>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="description-section mt-4">
                                    <h5 className="fw-bold mb-3">Mô tả sản phẩm</h5>
                                    <p className="text-muted">{product.description}</p>
                                </div>
                            )}

                            {/* Brand */}
                            {product.brand && (
                                <div className="brand-section mt-3">
                                    <strong>Thương hiệu:</strong>
                                    <span className="ms-2 text-primary">{product.brand}</span>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}
