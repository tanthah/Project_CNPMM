import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../redux/authSlice'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import {
  validateLoginForm,
  sanitizeInput,
  validateEmail,
  validatePassword
} from '../utils/validation'

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, error, token } = useSelector((s) => s.auth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  // Check for Google OAuth error from URL
  const googleError = searchParams.get('error')

  const handleSubmit = async (e) => {
    e.preventDefault()

    setFormErrors({})

    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)

    const emailError = validateEmail(sanitizedEmail)
    if (emailError) {
      setFormErrors({ email: emailError })
      return
    }

    const errors = validateLoginForm(sanitizedEmail, sanitizedPassword)
    const passwordRuleError = validatePassword(sanitizedPassword)

    if (passwordRuleError) {
      setFormErrors(prev => ({ ...prev, password: passwordRuleError }))
      return
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const res = await dispatch(login({
        email: sanitizedEmail,
        password: sanitizedPassword
      })).unwrap()

      // ⭐ Điều hướng theo role
      if (res?.token) {
        if (res.user?.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      }

    } catch (err) {
      // handled in slice
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_URL}/api/auth/google`
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <Card.Title className="text-center mb-4 fw-bold fs-4">
              <i className="bi bi-box-arrow-in-right me-2"></i>
              Đăng Nhập
            </Card.Title>

            {/* Google OAuth Error */}
            {googleError && (
              <Alert variant="danger" className="mb-3">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Đăng nhập Google thất bại. Vui lòng thử lại.
              </Alert>
            )}



            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-500 text-primary">
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (formErrors.email) {
                      setFormErrors(prev => ({ ...prev, email: '' }))
                    }
                  }}
                  isInvalid={!!formErrors.email}
                  disabled={loading}
                  placeholder="Nhập email của bạn"
                  autoComplete="email"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-500 text-primary">
                  <i className="bi bi-lock me-2"></i>
                  Mật khẩu
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: '' }))
                      }
                    }}
                    isInvalid={!!formErrors.password}
                    disabled={loading}
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                  />
                  <Button
                    variant="link"
                    className="position-absolute end-0 top-50 translate-middle-y"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ textDecoration: 'none' }}
                    tabIndex={-1}
                  >
                    <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100 fw-600"
                size="lg"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Đăng nhập
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="d-flex align-items-center my-4">
                <hr className="flex-grow-1" />
                <span className="px-3 text-muted">hoặc</span>
                <hr className="flex-grow-1" />
              </div>

              {/* Google Login Button */}
              <Button
                variant="outline-secondary"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng nhập với Google
              </Button>

              {error && (
                <Alert variant="danger" className="mt-3 mb-0">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              {token && (
                <Alert variant="success" className="mt-3 mb-0">
                  <i className="bi bi-check-circle me-2"></i>
                  Đăng nhập thành công!
                </Alert>
              )}
            </Form>

            <div className="mt-4 text-center">
              <p className="mb-2">
                Chưa có tài khoản?
                <Link to="/register" className="text-primary fw-500">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Đăng ký
                </Link>
              </p>
              <p className="mb-0">
                <Link to="/forgot-password" className="text-primary fw-500">
                  <i className="bi bi-key me-1"></i>
                  Quên mật khẩu?
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container >
  )
}

