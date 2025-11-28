import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../redux/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import { 
  validateLoginForm, 
  sanitizeInput,  
  validateEmail } 
  from '../utils/validation'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, token } = useSelector((s) => s.auth)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setFormErrors({})
    
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email)
    const sanitizedPassword = sanitizeInput(password)
    
    // Validate form
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }
    const errors = validateLoginForm(sanitizedEmail, sanitizedPassword);

    
    const passwordRuleError = validatePassword(sanitizedPassword);
    if (passwordRuleError) {
      setFormErrors(prev => ({ ...prev, password: passwordRuleError }));
      return;
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
      if (res?.token) navigate('/dashboard')
    } catch (err) {
      // Error handled by slice
    }
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