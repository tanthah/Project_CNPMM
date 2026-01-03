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
      <div style={{ width: '100%', maxWidth: '400px' }}>
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

            {/* Google Login Button */}
            <Button
              variant="outline-dark"
              className="w-100 mb-3 d-flex align-items-center justify-content-center"
              onClick={handleGoogleLogin}
              style={{
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '500'
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48" className="me-2">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Đăng nhập với Google
            </Button>

            {/* Divider */}
            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1" />
              <span className="px-3 text-muted small">hoặc đăng nhập bằng email</span>
              <hr className="flex-grow-1" />
            </div>

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
    </Container>
  )
}

