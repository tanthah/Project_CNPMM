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
            
              <h3 className="mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </h3>
            
            
            

              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/review-profile" 
                  variant="primary" 
                  size="lg"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Xem hồ sơ
                </Button>

                <Button 
                  as={Link} 
                  to="/forgot-password" 
                  variant="primary" 
                  size="lg"
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  Đổi mật khẩu
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
            
          </Card>
        </Col>
      </Row>
    </Container>
  )
}