// frontend/src/pages/ReviewProfile.jsx - COMPLETE VERSION
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Container, Card, Button, Row, Col, Image, Alert, Spinner } from 'react-bootstrap'
import { logoutAsync } from '../redux/authSlice'
import { fetchUserProfile } from '../redux/editUserSlice'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ReviewProfile() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const authUser = useSelector((s) => s.auth.user)
  const { user, loading, error } = useSelector((s) => s.editUser)

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logoutAsync())
    navigate('/login')
  }

  // Helper function to get correct avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar && user.avatar.includes('cloudinary.com')) {
      return user.avatar;
    }
    return 'https://via.placeholder.com/40?text=U';
  };

  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/200?text=Avatar'
  }

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải thông tin...</p>
        </Container>
        <Footer />
      </>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <Container className="py-5" style={{ flex: 1 }}>
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Hồ Sơ Cá Nhân
                  </h3>
                  <Link to="/" className="btn btn-light btn-sm">
                    <i className="bi bi-house me-1"></i> Trang chủ
                  </Link>
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {error && (
                  <Alert variant="warning" className="mb-4">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}

                <div className="text-center mb-4">
                  <Image
                    src={getAvatarUrl()}
                    roundedCircle
                    style={{
                      width: '200px',
                      height: '200px',
                      objectFit: 'cover',
                      border: '4px solid #0d6efd',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                    }}
                    onError={handleImageError}
                  />
                </div>

                <h4 className="text-center mb-4">
                  Xin chào, <span className="text-primary">{user?.name || authUser?.name || 'Người dùng'}!</span>
                </h4>

                <Card className="mb-4 bg-light">
                  <Card.Body>
                    <h6 className="text-muted mb-3">Thông tin cá nhân</h6>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex align-items-center">
                        <div className="text-muted" style={{ width: '120px' }}>
                          <i className="bi bi-envelope me-2"></i>Email:
                        </div>
                        <div className="fw-bold text-truncate" style={{ flex: 1 }}>
                          {user?.email || authUser?.email || 'N/A'}
                        </div>
                      </div>

                      <div className="d-flex align-items-center">
                        <div className="text-muted" style={{ width: '120px' }}>
                          <i className="bi bi-telephone me-2"></i>Điện thoại:
                        </div>
                        <div className="fw-bold">
                          {user?.phone || 'Chưa cập nhật'}
                        </div>
                      </div>

                      <div className="d-flex align-items-center">
                        <div className="text-muted" style={{ width: '120px' }}>
                          <i className="bi bi-calendar me-2"></i>Ngày sinh:
                        </div>
                        <div className="fw-bold">
                          {user?.dateOfBirth
                            ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                            : 'Chưa cập nhật'
                          }
                        </div>
                      </div>

                      <div className="d-flex align-items-center">
                        <div className="text-muted" style={{ width: '120px' }}>
                          <i className="bi bi-gender-ambiguous me-2"></i>Giới tính:
                        </div>
                        <div className="fw-bold">
                          {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
                        </div>
                      </div>

                      <div className="d-flex align-items-center">
                        <div className="text-muted" style={{ width: '120px' }}>
                          <i className="bi bi-shield-check me-2"></i>Vai trò:
                        </div>
                        <div>
                          <span className="badge bg-info">
                            {user?.role || authUser?.role || 'user'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="d-grid gap-2">
                  <Button
                    as={Link}
                    to="/edit-profile"
                    variant="primary"
                    size="lg"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Chỉnh sửa hồ sơ
                  </Button>



                  <Button
                    variant="outline-danger"
                    size="lg"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  )
}