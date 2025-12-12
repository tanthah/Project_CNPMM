// frontend/src/pages/Home.jsx - UPDATED VERSION
import React, { useEffect } from 'react'
import { Container, Alert, Row, Col, Card } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  fetchLatestProducts,
  fetchBestSellers,
  fetchMostViewed,
  fetchTopDiscounts
} from '../redux/productSlice'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductSection from '../components/ProductSection'
import './css/Home.css'

export default function Home() {
  const dispatch = useDispatch()
  const location = useLocation()

  const { latest, bestSellers, mostViewed, topDiscounts, loading, error } = useSelector((s) => s.products)

  useEffect(() => {
    console.log('🔄 Home page mounted, fetching products...')
    dispatch(fetchLatestProducts())
    dispatch(fetchBestSellers())
    dispatch(fetchMostViewed())
    dispatch(fetchTopDiscounts())
  }, [dispatch])

  const features = [
    {
      icon: 'bi-shield-check',
      title: 'Chính hãng 100%',
      description: 'Sản phẩm chính hãng, bảo hành toàn quốc'
    },
    {
      icon: 'bi-truck',
      title: 'Giao hàng miễn phí',
      description: 'Miễn phí vận chuyển cho đơn từ 500K'
    },
    {
      icon: 'bi-credit-card',
      title: 'Trả góp 0%',
      description: 'Hỗ trợ trả góp lãi suất 0%'
    },
    {
      icon: 'bi-arrow-repeat',
      title: 'Đổi trả dễ dàng',
      description: 'Đổi trả trong vòng 15 ngày'
    }
  ];

  const brands = [
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Samsung', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Xiaomi', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Xiaomi_logo.svg' },
    { name: 'Oppo', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/OPPO_LOGO_2019.svg' },
    { name: 'Asus', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg' },
    { name: 'Dell', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg' }
  ];

  return (
    <div className="home-page">
      <Header />

      <main>
        {/* Hero Banner */}
        <div className="hero-banner">
          <Container>
            <div className="hero-content text-center py-5">
              <div className="hero-badge mb-3">
                <span className="badge bg-white text-primary rounded-pill px-3 py-2 shadow-sm">
                  <i className="bi bi-stars me-2"></i>
                  Bộ sưu tập Mùa Hè 2025
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4">
                Chào mừng đến với <span className="text-gradient">TV Shop</span>
              </h1>
              <p className="lead text-white-50 mb-5 mx-auto" style={{ maxWidth: '600px' }}>
                Khám phá hàng ngàn sản phẩm công nghệ chất lượng cao với mức giá ưu đãi nhất dành cho sinh viên.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <button className="btn btn-light btn-lg rounded-pill px-5 fw-bold shadow-lg hover-scale">
                  <i className="bi bi-search me-2"></i>
                  Khám phá ngay
                </button>
                <button className="btn btn-outline-light btn-lg rounded-pill px-5 fw-bold hover-scale">
                  <i className="bi bi-percent me-2"></i>
                  Xem khuyến mãi
                </button>
              </div>
            </div>
          </Container>
          <div className="shape-1"></div>
          <div className="shape-2"></div>
        </div>

        {/* Features Section */}
        <section className="features-section">
          <Container>
            <Row>
              {features.map((feature, idx) => (
                <Col key={idx} md={3} sm={6} className="mb-4">
                  <Card className="feature-card border-0 shadow-sm h-100">
                    <Card.Body className="text-center p-4">
                      <div className="feature-icon mb-3">
                        <i className={`bi ${feature.icon}`}></i>
                      </div>
                      <h5 className="fw-bold mb-2">{feature.title}</h5>
                      <p className="text-muted small mb-0">{feature.description}</p>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Main Content */}
        <Container className="py-4 main-content">
          {error && (
            <Alert variant="danger" dismissible>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}

          {/* 1. Sản phẩm mới nhất */}
          <ProductSection
            title="Sản phẩm mới nhất"
            icon="bi bi-stars"
            products={latest}
            loading={loading}
            columns={4}
          />

          {/* 2. Sản phẩm bán chạy */}
          <ProductSection
            title="Bán chạy nhất"
            icon="bi bi-fire"
            products={bestSellers}
            loading={loading}
            columns={4}
          />

          {/* 3. Sản phẩm xem nhiều */}
          <ProductSection
            title="Xem nhiều nhất"
            icon="bi bi-eye"
            products={mostViewed}
            loading={loading}
            columns={4}
          />

          {/* 4. Khuyến mãi hot */}
          <ProductSection
            title="Khuyến mãi HOT"
            icon="bi bi-percent"
            products={topDiscounts}
            loading={loading}
            columns={4}
          />
        </Container>

        {/* Brands Section */}
        <section className="brands-section">
          <Container>
            <h2 className="text-center mb-5">
              <span className="section-badge">Thương hiệu nổi bật</span>
            </h2>
            <Row className="justify-content-center">
              {brands.map((brand, idx) => (
                <Col key={idx} xs={4} md={2} className="mb-4">
                  <div className="brand-logo">
                    <img src={brand.logo} alt={brand.name} />
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Newsletter Section */}
        <section className="newsletter-section">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6} className="text-center">
                <i className="bi bi-envelope-heart newsletter-icon"></i>
                <h2 className="mb-3">Đăng ký nhận tin khuyến mãi</h2>
                <p className="text-muted mb-4">
                  Nhận thông báo về sản phẩm mới và các chương trình khuyến mãi hấp dẫn
                </p>
                <div className="newsletter-form">
                  <div className="input-group">
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      placeholder="Nhập email của bạn..."
                    />
                    <button className="btn btn-primary btn-lg px-4">
                      <i className="bi bi-send me-2"></i>
                      Đăng ký
                    </button>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  )
}