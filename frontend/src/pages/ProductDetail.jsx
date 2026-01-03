// frontend/src/pages/ProductDetail.jsx - COMPLETE ENHANCED VERSION
import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Button, Badge, Spinner, Alert, Card, Nav, Form, Breadcrumb, ProgressBar } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProductById, clearCurrentProduct } from '../redux/productSlice'
import { addToCart } from '../redux/cartSlice'
import { addToWishlist, removeFromWishlist, checkWishlist } from '../redux/wishlistSlice'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductReviewsSection from '../components/ProductReviewsSection'
import ProductCommentsSection from '../components/ProductCommentsSection'
import SimilarProductsSection from '../components/SimilarProductsSection'
import productApi from '../api/productApi'
import viewedProductApi from '../api/viewedProductApi'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import './css/ProductDetail.css'
import { useNotification } from '../components/NotificationProvider'
import { useSocket } from '../contexts/SocketContext'

export default function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const notify = useNotification()
    const { socket } = useSocket()
    const hasFetched = useRef(false)

    const { currentProduct, loading, error } = useSelector((s) => s.products)
    const { token } = useSelector((s) => s.auth)
    const { updating } = useSelector((s) => s.cart)

    const [quantity, setQuantity] = useState(1)
    const [thumbsSwiper, setThumbsSwiper] = useState(null)
    const [productStats, setProductStats] = useState(null)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [wishlistLoading, setWishlistLoading] = useState(false)

    // ✅ Variant selection state
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [availableAttributes, setAvailableAttributes] = useState({})
    const [selectedAttributes, setSelectedAttributes] = useState({})


    // Fetch product data
    useEffect(() => {
        if (!id) return;

        if (!hasFetched.current) {
            hasFetched.current = true;
            dispatch(clearCurrentProduct());
            dispatch(fetchProductById(id));
            loadProductData();
        }

        return () => {
            dispatch(clearCurrentProduct());
        };
    }, [id, dispatch]);

    // Load additional data (stats, viewed products)
    const loadProductData = async () => {
        try {
            // Load product stats
            const statsRes = await productApi.getProductStats(id);
            setProductStats(statsRes.data.stats);

        } catch (err) {
            console.error('Error loading product data:', err);
        }
    };

    // Track view and check wishlist status
    useEffect(() => {
        if (currentProduct && token) {
            // Track product view
            viewedProductApi.trackView(currentProduct._id);

            // Check wishlist status
            checkWishlistStatus();
        }
    }, [currentProduct, token]);

    // ✅ Real-time Stock Update
    useEffect(() => {
        if (!socket || !id) return;

        const handleUpdate = (updatedProduct) => {
            if (updatedProduct._id === id) {
                // Dispatch action to update product in store without full refetch if possible
                // For now, we simple refetch or update local state if we had it.
                // Since we rely on Redux 'currentProduct', asking to refetch is safest
                dispatch(fetchProductById(id));
                notify.info('Thông tin sản phẩm vừa được cập nhật');
            }
        };

        socket.on('product_updated', handleUpdate);
        return () => socket.off('product_updated', handleUpdate);
    }, [socket, id, dispatch, notify]);

    // Similar sections moved into dedicated components

    // Check if product is in wishlist
    const checkWishlistStatus = async () => {
        if (!token || !currentProduct) return;

        try {
            const result = await dispatch(checkWishlist(currentProduct._id)).unwrap();
            setIsInWishlist(result.inWishlist);
        } catch (err) {
            console.error('Error checking wishlist:', err);
        }
    };

    // ✅ Initialize variants when product loads
    useEffect(() => {
        if (currentProduct && currentProduct.hasVariants && currentProduct.variants?.length > 0) {
            // Extract unique attribute values
            const attrs = {};
            currentProduct.variants.forEach(v => {
                Object.entries(v.attributes || {}).forEach(([key, value]) => {
                    if (value) {
                        if (!attrs[key]) attrs[key] = new Set();
                        attrs[key].add(value);
                    }
                });
            });

            // Convert Sets to Arrays
            const formattedAttrs = {};
            Object.entries(attrs).forEach(([key, valueSet]) => {
                formattedAttrs[key] = Array.from(valueSet);
            });
            setAvailableAttributes(formattedAttrs);

            // Auto-select first variant
            setSelectedVariant(currentProduct.variants[0]);
            const firstAttrs = {};
            Object.entries(currentProduct.variants[0].attributes || {}).forEach(([k, v]) => {
                if (v) firstAttrs[k] = v;
            });
            setSelectedAttributes(firstAttrs);
        } else {
            // No variants, clear state
            setSelectedVariant(null);
            setAvailableAttributes({});
            setSelectedAttributes({});
        }
    }, [currentProduct]);

    // ✅ Handle attribute selection change - Auto-select other attributes
    const handleAttributeChange = (attributeKey, attributeValue) => {
        // Find first variant that has this specific attribute value
        const matchingVariant = currentProduct.variants.find(v => {
            return v.attributes[attributeKey] === attributeValue;
        });

        if (matchingVariant) {
            // Auto-fill ALL attributes from this variant
            const allAttrs = {};
            Object.entries(matchingVariant.attributes || {}).forEach(([k, v]) => {
                if (v) allAttrs[k] = v;
            });

            setSelectedAttributes(allAttrs);
            setSelectedVariant(matchingVariant);

            // Reset quantity if exceeds new stock
            if (quantity > matchingVariant.stock) {
                setQuantity(Math.min(1, matchingVariant.stock));
            }
        }
    };

    const handleIncrease = () => {
        const maxStock = selectedVariant ? selectedVariant.stock : (currentProduct?.stock || 0);
        if (quantity < maxStock) {
            setQuantity(q => q + 1)
        }
    }

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1)
        }
    }

    const handleAddToCart = async () => {
        if (!token) {
            notify.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
            navigate('/login')
            return
        }

        // ✅ Validate variant selection
        if (currentProduct.hasVariants && !selectedVariant) {
            notify.error('Vui lòng chọn phiên bản sản phẩm')
            return
        }

        try {
            await dispatch(addToCart({
                productId: currentProduct._id,
                quantity,
                variantId: selectedVariant?._id // ✅ Include variant ID
            })).unwrap()

            const productName = selectedVariant
                ? `${currentProduct.name} - ${selectedVariant.name}`
                : currentProduct.name;
            notify.success(`Đã thêm ${quantity} ${productName} vào giỏ hàng`);
        } catch (err) {
            notify.error(err || 'Không thể thêm vào giỏ hàng')
        }
    }

    const handleBuyNow = async () => {
        if (!token) {
            notify.info('Vui lòng đăng nhập để mua hàng')
            navigate('/login')
            return
        }

        // ✅ Validate variant selection
        if (currentProduct.hasVariants && !selectedVariant) {
            notify.error('Vui lòng chọn phiên bản sản phẩm')
            return
        }

        const displayPrice = selectedVariant
            ? selectedVariant.price
            : (currentProduct.finalPrice || currentProduct.price);

        const displayStock = selectedVariant
            ? selectedVariant.stock
            : currentProduct.stock;

        navigate('/checkout', {
            state: {
                buyNow: true,
                product: {
                    productId: currentProduct._id,
                    variantId: selectedVariant?._id, // ✅ Include variant
                    quantity: quantity,
                    productName: currentProduct.name,
                    variantName: selectedVariant?.name,
                    productImage: currentProduct.images[0],
                    finalPrice: displayPrice,
                    stock: displayStock || 0
                }
            }
        })
    }

    // ✅ HANDLE WISHLIST TOGGLE - WITH RED COLOR INDICATOR
    const handleWishlistToggle = async () => {
        if (!token) {
            notify.info('Vui lòng đăng nhập để sử dụng tính năng này')
            navigate('/login')
            return
        }

        setWishlistLoading(true)
        try {
            if (isInWishlist) {
                await dispatch(removeFromWishlist(currentProduct._id)).unwrap()
                setIsInWishlist(false)
            } else {
                await dispatch(addToWishlist(currentProduct._id)).unwrap()
                setIsInWishlist(true)
            }
        } catch (err) {
            notify.error(err || 'Có lỗi xảy ra')
        } finally {
            setWishlistLoading(false)
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
                </Container>
                <Footer />
            </>
        )
    }

    if (error || !currentProduct) {
        return (
            <>
                <Header />
                <Container className="py-5">
                    <Alert variant="danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error || 'Không tìm thấy sản phẩm'}
                    </Alert>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        <i className="bi bi-house me-2"></i>
                        Về trang chủ
                    </Button>
                </Container>
                <Footer />
            </>
        )
    }

    const product = currentProduct
    const isOutOfStock = product.stock === 0
    const images = product.images && product.images.length > 0
        ? product.images
        : ['/placeholder-product.jpg']

    return (
        <div className="product-detail-page">
            <Header />

            <Container className="py-4">
                {/* 🍞 Breadcrumb Navigation */}
                <Breadcrumb className="mb-4 product-breadcrumb">
                    <LinkContainer to="/">
                        <Breadcrumb.Item>Trang chủ</Breadcrumb.Item>
                    </LinkContainer>
                    <LinkContainer to="/products">
                        <Breadcrumb.Item>Sản phẩm</Breadcrumb.Item>
                    </LinkContainer>
                    {product.categoryId && (
                        <LinkContainer to={`/category/${product.categoryId._id}`}>
                            <Breadcrumb.Item>{product.categoryId.name}</Breadcrumb.Item>
                        </LinkContainer>
                    )}
                    <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
                </Breadcrumb>

                <Row className="g-4">
                    {/* Product Images */}
                    <Col lg={5}>
                        <div className="product-images-section">
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

                    {/* Product Info */}
                    <Col lg={7}>
                        <div className="product-info-section">
                            <h1 className="product-title">{product.name}</h1>

                            {product.categoryId && (
                                <div className="mb-3">
                                    <Badge bg="secondary" className="category-badge">
                                        <i className="bi bi-tag me-1"></i>
                                        {product.categoryId.name}
                                    </Badge>
                                </div>
                            )}

                            <div className="price-box">
                                {(() => {
                                    // Determine which price to show
                                    const displayPrice = selectedVariant ? selectedVariant.price : (product.finalPrice || product.price || 0);
                                    const originalPrice = selectedVariant ? null : product.price;

                                    return (
                                        <>
                                            {product.discount > 0 && originalPrice && !selectedVariant && (
                                                <>
                                                    <div className="original-price">
                                                        {originalPrice.toLocaleString('vi-VN')}đ
                                                    </div>
                                                    <Badge bg="danger" className="discount-badge-detail ms-2">
                                                        -{product.discount}%
                                                    </Badge>
                                                </>
                                            )}
                                            <div className="final-price">
                                                {displayPrice.toLocaleString('vi-VN')}đ
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>

                            {/* ✅ PRODUCT STATS SECTION */}
                            {productStats && (
                                <div className="product-stats-detail mb-3">
                                    <Row className="g-2">
                                        <Col xs={6} md={3}>
                                            <div className="stat-card text-center p-2 bg-light rounded">
                                                <i className="bi bi-eye text-primary fs-4"></i>
                                                <div className="fw-bold">{productStats.views}</div>
                                                <small className="text-muted">Lượt xem</small>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="stat-card text-center p-2 bg-light rounded">
                                                <i className="bi bi-cart-check text-success fs-4"></i>
                                                <div className="fw-bold">{productStats.sold}</div>
                                                <small className="text-muted">Đã bán</small>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="stat-card text-center p-2 bg-light rounded">
                                                <i className="bi bi-people text-info fs-4"></i>
                                                <div className="fw-bold">{productStats.uniqueBuyers}</div>
                                                <small className="text-muted">Người mua</small>
                                            </div>
                                        </Col>
                                        <Col xs={6} md={3}>
                                            <div className="stat-card text-center p-2 bg-light rounded">
                                                <i className="bi bi-chat-left-text text-warning fs-4"></i>
                                                <div className="fw-bold">{productStats.uniqueReviewers}</div>
                                                <small className="text-muted">Đánh giá</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {/* ✅ VARIANT SELECTOR - Only show if product has variants */}
                            {product.hasVariants && product.variants?.length > 0 && (
                                <div className="variant-selector-section my-4">
                                    <h6 className="fw-bold mb-3">Chọn phiên bản:</h6>

                                    {/* Color Selection */}
                                    {availableAttributes.color && availableAttributes.color.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">Màu sắc:</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {availableAttributes.color.map(color => (
                                                    <Button
                                                        key={color}
                                                        size="sm"
                                                        variant={selectedAttributes.color === color ? "primary" : "outline-secondary"}
                                                        onClick={() => handleAttributeChange('color', color)}
                                                        className="variant-option-btn"
                                                    >
                                                        {color}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* RAM Selection */}
                                    {availableAttributes.ram && availableAttributes.ram.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">RAM:</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {availableAttributes.ram.map(ram => (
                                                    <Button
                                                        key={ram}
                                                        size="sm"
                                                        variant={selectedAttributes.ram === ram ? "primary" : "outline-secondary"}
                                                        onClick={() => handleAttributeChange('ram', ram)}
                                                        className="variant-option-btn"
                                                    >
                                                        {ram}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Storage Selection */}
                                    {availableAttributes.storage && availableAttributes.storage.length > 0 && (
                                        <div className="mb-3">
                                            <label className="form-label small text-muted">Bộ nhớ:</label>
                                            <div className="d-flex gap-2 flex-wrap">
                                                {availableAttributes.storage.map(storage => (
                                                    <Button
                                                        key={storage}
                                                        size="sm"
                                                        variant={selectedAttributes.storage === storage ? "primary" : "outline-secondary"}
                                                        onClick={() => handleAttributeChange('storage', storage)}
                                                        className="variant-option-btn"
                                                    >
                                                        {storage}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected Variant Info */}
                                    {selectedVariant && (
                                        <div className="selected-variant-info mt-2 p-2 bg-light rounded">
                                            <small className="text-muted">
                                                <i className="bi bi-check-circle text-success me-1"></i>
                                                <strong>{selectedVariant.name}</strong> - SKU: {selectedVariant.sku}
                                            </small>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="stock-section my-3">
                                <strong className="me-2">Tình trạng:</strong>
                                {(() => {
                                    const stock = selectedVariant ? selectedVariant.stock : product.stock;
                                    const outOfStock = stock === 0;

                                    return outOfStock ? (
                                        <Badge bg="danger">
                                            <i className="bi bi-x-circle me-1"></i>
                                            Hết hàng
                                        </Badge>
                                    ) : (
                                        <Badge bg="success">
                                            <i className="bi bi-check-circle me-1"></i>
                                            Còn {stock} sản phẩm
                                        </Badge>
                                    );
                                })()}
                            </div>

                            <hr />

                            {/* Quantity Controls */}
                            <div className="quantity-section my-4">
                                <strong className="me-3">Số lượng:</strong>
                                <div className="quantity-controls">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleDecrease}
                                        disabled={quantity <= 1 || isOutOfStock || updating}
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
                                        disabled={quantity >= product.stock || isOutOfStock || updating}
                                    >
                                        <i className="bi bi-plus"></i>
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons d-flex gap-2 flex-wrap">
                                <Button
                                    variant="outline-primary"
                                    size="lg"
                                    className="flex-grow-1"
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock || updating}
                                >
                                    {updating ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Đang thêm...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-cart-plus me-2"></i>
                                            Thêm vào giỏ
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="danger"
                                    size="lg"
                                    className="flex-grow-1"
                                    onClick={handleBuyNow}
                                    disabled={isOutOfStock}
                                >
                                    <i className="bi bi-lightning-fill me-2"></i>
                                    Mua ngay
                                </Button>

                                {/* ✅ WISHLIST BUTTON - RED WHEN IN WISHLIST */}
                                <Button
                                    variant={isInWishlist ? "danger" : "outline-danger"}
                                    size="lg"
                                    onClick={handleWishlistToggle}
                                    disabled={wishlistLoading}
                                    style={{ minWidth: '50px' }}
                                    title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                                >
                                    {wishlistLoading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        <i className={`bi ${isInWishlist ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                                    )}
                                </Button>
                            </div>

                            {product.brand && (
                                <div className="brand-section mt-3">
                                    <strong>Thương hiệu:</strong>
                                    <span className="ms-2 text-primary">{product.brand}</span>
                                </div>
                            )}

                            {product.description && (
                                <div className="description-section mt-4">
                                    <h5 className="fw-bold mb-3">Mô tả sản phẩm</h5>
                                    <p className="text-muted">{product.description}</p>
                                </div>
                            )}


                        </div>
                    </Col>
                </Row>

                <div className="mt-5">
                    {/* 1. Reviews Section */}
                    <ProductReviewsSection productId={id} />

                    {/* 2. Comments Section */}
                    <ProductCommentsSection productId={id} />

                    {/* 3. Similar Products Section */}
                    <SimilarProductsSection productId={id} />
                </div>

            </Container>

            <Footer />
        </div >
    )
}
