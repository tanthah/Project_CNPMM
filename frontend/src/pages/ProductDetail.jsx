// frontend/src/pages/ProductDetail.jsx - COMPLETE ENHANCED VERSION
import React, { useEffect, useState, useRef } from 'react'
import { Container, Row, Col, Button, Badge, Spinner, Alert, Card, Nav, Form } from 'react-bootstrap'
import { useParams, useNavigate } from 'react-router-dom'
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

export default function ProductDetail() {
    const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const notify = useNotification()
    const hasFetched = useRef(false)

    const { currentProduct, loading, error } = useSelector((s) => s.products)
    const { token } = useSelector((s) => s.auth)
    const { updating } = useSelector((s) => s.cart)
    
    const [quantity, setQuantity] = useState(1)
    const [thumbsSwiper, setThumbsSwiper] = useState(null)
    const [addCartSuccess, setAddCartSuccess] = useState(false)
    const [productStats, setProductStats] = useState(null)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const [wishlistLoading, setWishlistLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('reviews')

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

    const handleAddToCart = async () => {
        if (!token) {
            notify.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
            navigate('/login')
            return
        }

        try {
            await dispatch(addToCart({ 
                productId: currentProduct._id, 
                quantity 
            })).unwrap()
            
            setAddCartSuccess(true)
            setTimeout(() => setAddCartSuccess(false), 3000)
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

        navigate('/checkout', {
            state: {
                buyNow: true,
                product: {
                    productId: currentProduct._id,
                    quantity: quantity,
                    productName: currentProduct.name,
                    productImage: currentProduct.images[0],
                    finalPrice: currentProduct.finalPrice || currentProduct.price,
                    stock: currentProduct.stock || 0
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
                {addCartSuccess && (
                    <Alert variant="success" dismissible onClose={() => setAddCartSuccess(false)}>
                        <i className="bi bi-check-circle me-2"></i>
                        Đã thêm sản phẩm vào giỏ hàng!
                    </Alert>
                )}

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
                    <Nav variant="pills" className="order-filters mb-4">
                        <Nav.Item>
                            <Nav.Link active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>Đánh giá</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={activeTab === 'comments'} onClick={() => setActiveTab('comments')}>Bình luận</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                            <Nav.Link active={activeTab === 'similar'} onClick={() => setActiveTab('similar')}>Sản phẩm tương tự</Nav.Link>
                        </Nav.Item>
                    </Nav>

                    {activeTab === 'reviews' && (
                        <> 
                            {/* Review section is rendered below */}
                        </>
                    )}

                    {activeTab === 'comments' && (
                        <ProductCommentsSection productId={id} />
                    )}

                    {activeTab === 'similar' && (
                        <SimilarProductsSection productId={id} />
                    )}
                </div>

        {activeTab === 'reviews' && (
            <ProductReviewsSection productId={id} />
        )}

            </Container>

            <Footer />
        </div>
    )
}
