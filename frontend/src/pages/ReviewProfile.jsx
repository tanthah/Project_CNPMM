import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Container, Card, Button, Row, Col, Image } from 'react-bootstrap'
import { logout } from '../redux/authSlice'
import { fetchUserProfile } from '../redux/editUserSlice'

export default function Dashboard() {
  const dispatch = useDispatch()
  const authUser = useSelector((s) => s.auth.user)
  const { user } = useSelector((s) => s.editUser)

  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col xs={12} md={0} lg={0}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="mb-0">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Review Profile
                    </h3>
                    <Link to="/dashboard" className="btn btn-light btn-sm">
                        <i className="bi bi-arrow-left me-1"></i> Quay lại
                    </Link>
                </div>
            </Card.Header>
            
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <Image
                  src={user?.avatar ? `http://localhost:4000${user.avatar}` : 'https://via.placeholder.com/120?text=Avatar'}
                  roundedCircle
                  style={{ 
                    width: '120px', 
                    height: '120px', 
                    objectFit: 'cover',
                    border: '4px solid #0d6efd',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              <h4 className="text-center mb-4">
                Xin chào, <span className="text-primary">{user?.name || authUser?.name || 'Người dùng'}!</span>
              </h4>

              <Card className="mb-4 bg-light">
                <Card.Body>
                  <h6 className="text-muted mb-3">Thông tin cá nhân</h6>
                  
                  <Row className="mb-2">
                    <Col xs={4}>
                      <small className="text-muted">
                        <i className="bi bi-envelope me-2"></i>Email:
                      </small>
                    </Col>
                    <Col xs={8}>
                      <small className="fw-bold">{user?.email || authUser?.email || 'N/A'}</small>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col xs={4}>
                      <small className="text-muted">
                        <i className="bi bi-telephone me-2"></i>Điện thoại:
                      </small>
                    </Col>
                    <Col xs={8}>
                      <small className="fw-bold">{user?.phone || 'Chưa cập nhật'}</small>
                    </Col>
                  </Row>

                  <Row className="mb-2">
                    <Col xs={4}>
                      <small className="text-muted">
                        <i className="bi bi-calendar me-2"></i>Ngày sinh:
                      </small>
                    </Col>
                    <Col xs={8}>
                      <small className="fw-bold">
                        {user?.dateOfBirth 
                          ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') 
                          : 'Chưa cập nhật'
                        }
                      </small>
                    </Col>
                  </Row>

                  <Row>
                    <Col xs={4}>
                      <small className="text-muted">
                        <i className="bi bi-gender-ambiguous me-2"></i>Giới tính:
                      </small>
                    </Col>
                    <Col xs={8}>
                      <small className="fw-bold">
                        {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}
                      </small>
                    </Col>
                  </Row>
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
  )
}