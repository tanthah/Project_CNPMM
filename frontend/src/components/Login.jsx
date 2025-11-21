import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../features/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((s) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await dispatch(login({ email, password })).unwrap()
      if (res?.token) navigate('/dashboard')
    } catch (err) {
      // error handled by slice
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <Card.Title className="text-center mb-4 fw-bold fs-4">Login</Card.Title>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-500 text-primary">Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your email"
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-500 text-primary">Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  placeholder="Enter your password"
                />
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 fw-600"
                size="lg"
              >
                {loading ? 'Logging...' : 'Login'}
              </Button>

              {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              {token && <Alert variant="success" className="mt-3">✅ Logged in</Alert>}
            </Form>

            <div className="mt-4 text-center">
              <p className="mb-2">
                Chưa có tài khoản? <Link to="/register" className="text-primary fw-500">Đăng ký</Link>
              </p>
              <p className="mb-0">
                <Link to="/forgot-password" className="text-primary fw-500">Quên mật khẩu?</Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}