import React, { useEffect } from 'react'
import { Container, Alert } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  fetchLatestProducts,
  fetchBestSellers,
  fetchMostViewed,
  fetchTopDiscounts
} from '../redux/productSlice'
import { logout } from '../redux/authSlice'
import ProductSection from '../components/ProductSection'
import './Dashboard.css'

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user } = useSelector((s) => s.auth)
  const { latest, bestSellers, mostViewed, topDiscounts, loading, error } = useSelector((s) => s.products)

  useEffect(() => {
    // Fetch all product lists on mount
    dispatch(fetchLatestProducts())
    dispatch(fetchBestSellers())
    dispatch(fetchMostViewed())
    dispatch(fetchTopDiscounts())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleEditProfile = () => {
    navigate('/edit-profile')
  }

  const handleReviewProfile = () => {
    navigate('/review-profile')
  }

  return (
    <div className="dashboard-page">
      {/* Header / Navbar */}
      <div className="dashboard-header">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <h3 className="mb-0 me-3 logo-text">
                <i className="bi bi-shop text-primary me-2"></i>
                <strong>UTE Shop</strong>
              </h3>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="text-muted d-none d-md-inline">Xin chào, <strong>{user?.name || 'User'}</strong>!</span>
              <button className="btn btn-outline-primary btn-sm rounded-pill" onClick={handleReviewProfile}>
                <i className="bi bi-person-circle me-1"></i>
                Hồ sơ
              </button>
              <button className="btn btn-outline-secondary btn-sm rounded-pill" onClick={handleEditProfile}>
                <i className="bi bi-pencil me-1"></i>
                Sửa
              </button>
              <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-1"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </Container>
      </div>

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
              Chào mừng đến với <span className="text-gradient">UTE Shop</span>
            </h1>
            <p className="lead text-white-50 mb-5 mx-auto" style={{ maxWidth: '600px' }}>
              Khám phá hàng ngàn sản phẩm công nghệ chất lượng cao với mức giá ưu đãi nhất dành cho sinh viên.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-light btn-lg rounded-pill px-5 fw-bold shadow-lg hover-scale">
                Khám phá ngay
              </button>
              <button className="btn btn-outline-light btn-lg rounded-pill px-5 fw-bold hover-scale">
                Xem khuyến mãi
              </button>
            </div>
          </div>
        </Container>

        {/* Decorative Shapes */}
        <div className="shape-1"></div>
        <div className="shape-2"></div>
      </div>

      {/* Main Content */}
      <Container className="py-4 main-content">
        {error && (
          <Alert variant="danger" dismissible>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* 1. Sản phẩm mới nhất - 8 items */}
        <ProductSection
          title="Sản phẩm mới nhất"
          icon="bi bi-stars"
          products={latest}
          loading={loading}
          columns={4}
        />

        {/* 2. Sản phẩm bán chạy - 6 items */}
        <ProductSection
          title="Bán chạy nhất"
          icon="bi bi-fire"
          products={bestSellers}
          loading={loading}
          columns={3}
        />

        {/* 3. Sản phẩm xem nhiều - 8 items */}
        <ProductSection
          title="Xem nhiều nhất"
          icon="bi bi-eye"
          products={mostViewed}
          loading={loading}
          columns={4}
        />

        {/* 4. Khuyến mãi hot - 4 items */}
        <ProductSection
          title="Khuyến mãi HOT"
          icon="bi bi-percent"
          products={topDiscounts}
          loading={loading}
          columns={4}
        />
      </Container>

      {/* Footer */}
      <footer className="dashboard-footer mt-5">
        <Container>
          <div className="text-center py-4 text-muted small">
            <p className="mb-1">© 2025 UTE Shop. All rights reserved.</p>
            <p className="mb-0">Made with <i className="bi bi-heart-fill text-danger"></i> by UTE Students</p>
          </div>
        </Container>
      </footer>
    </div>
  )
}