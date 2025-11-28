import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, verifyOtp, resetPassword, clearForgotPasswordState } from '../redux/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'
import {
  validateEmail,
  validateOTP,
  validatePassword,
  validateConfirmPassword,
  sanitizeInput
} from "../utils/validation";

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, otpSent, otpVerified, resetSuccess } = useSelector((s) => s.auth)

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formErrors, setFormErrors] = useState({})

  useEffect(() => {
    dispatch(clearForgotPasswordState())
  }, [dispatch])

  useEffect(() => {
    if (otpSent && step === 1) {
      setStep(2)
    }
  }, [otpSent, step])

  useEffect(() => {
    if (otpVerified && step === 2) {
      setStep(3)
    }
  }, [otpVerified, step])

  useEffect(() => {
    if (resetSuccess) {
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [resetSuccess, navigate])

  // Bước 1: Gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});
    
    const sanitizedEmail = sanitizeInput(email);
    const emailError = validateEmail(sanitizedEmail);
    
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    try {
      await dispatch(forgotPassword({ email: sanitizedEmail })).unwrap();
    } catch {}
  };

  // Bước 2: Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate và sanitize email (phòng trường hợp bị sửa đổi)
    const sanitizedEmail = sanitizeInput(email);
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    // Validate và sanitize OTP
    const sanitizedOtp = sanitizeInput(otp);
    const otpError = validateOTP(sanitizedOtp);
    if (otpError) {
      setFormErrors({ otp: otpError });
      return;
    }

    try {
      await dispatch(verifyOtp({ 
        email: sanitizedEmail, 
        otp: sanitizedOtp 
      })).unwrap();
    } catch {}
  };

  // Bước 3: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Validate và sanitize email
    const sanitizedEmail = sanitizeInput(email);
    const emailError = validateEmail(sanitizedEmail);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    // Validate và sanitize OTP
    const sanitizedOtp = sanitizeInput(otp);
    const otpError = validateOTP(sanitizedOtp);
    if (otpError) {
      setFormErrors({ otp: otpError });
      return;
    }

    // Validate và sanitize password
    const sanitizedPassword = sanitizeInput(newPassword);
    const passwordError = validatePassword(sanitizedPassword);
    if (passwordError) {
      setFormErrors({ password: passwordError });
      return;
    }

    // Validate confirm password
    const sanitizedConfirm = sanitizeInput(confirmPassword);
    const confirmError = validateConfirmPassword(sanitizedPassword, sanitizedConfirm);
    if (confirmError) {
      setFormErrors({ confirmPassword: confirmError });
      return;
    }

    try {
      await dispatch(resetPassword({ 
        email: sanitizedEmail, 
        otp: sanitizedOtp, 
        newPassword: sanitizedPassword 
      })).unwrap();
    } catch {}
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <Card.Title className="text-center mb-4 fw-bold fs-4">
              <i className="bi bi-key me-2"></i>
              Quên Mật khẩu
            </Card.Title>

            {/* Bước 1: Nhập Email */}
            {step === 1 && (
              <Form onSubmit={handleSendOtp}>
                <p className="text-muted mb-3">Nhập email của bạn để nhận mã OTP</p>
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
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send me-2"></i>
                      Gửi OTP
                    </>
                  )}
                </Button>
                {error && (
                  <Alert variant="danger" className="mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
              </Form>
            )}

            {/* Bước 2: Nhập OTP */}
            {step === 2 && (
              <Form onSubmit={handleVerifyOtp}>
                <Alert variant="success" className="mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  OTP đã được gửi đến {email}
                </Alert>
                <p className="text-muted mb-3">Vui lòng kiểm tra email và nhập mã OTP (6 chữ số)</p>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">
                    <i className="bi bi-shield-check me-2"></i>
                    Mã OTP
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value)
                      if (formErrors.otp) {
                        setFormErrors(prev => ({ ...prev, otp: '' }))
                      }
                    }}
                    maxLength="6"
                    isInvalid={!!formErrors.otp}
                    disabled={loading}
                    placeholder="Nhập 6 chữ số"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.otp}
                  </Form.Control.Feedback>
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Xác thực OTP
                    </>
                  )}
                </Button>
                {error && (
                  <Alert variant="danger" className="mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
                <div className="mt-3 text-center">
                  <Button
                    variant="link"
                    onClick={() => {
                      setStep(1)
                      setFormErrors({})
                      dispatch(clearForgotPasswordState())
                    }}
                    className="text-muted"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                  </Button>
                </div>
              </Form>
            )}

            {/* Bước 3: Nhập mật khẩu mới */}
            {step === 3 && (
              <Form onSubmit={handleResetPassword}>
                <Alert variant="success" className="mb-3">
                  <i className="bi bi-check-circle me-2"></i>
                  OTP hợp lệ
                </Alert>
                <p className="text-muted mb-3">Nhập mật khẩu mới của bạn</p>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">
                    <i className="bi bi-lock me-2"></i>
                    Mật khẩu mới
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (formErrors.password) {
                        setFormErrors(prev => ({ ...prev, password: '' }))
                      }
                    }}
                    isInvalid={!!formErrors.password}
                    disabled={loading}
                    placeholder="Nhập mật khẩu mới"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    <small>
                      Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                    </small>
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">
                    <i className="bi bi-lock-fill me-2"></i>
                    Xác nhận mật khẩu
                  </Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (formErrors.confirmPassword) {
                        setFormErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }
                    }}
                    isInvalid={!!formErrors.confirmPassword}
                    disabled={loading}
                    placeholder="Nhập lại mật khẩu"
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang đặt lại...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Đặt lại mật khẩu
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
                {resetSuccess && (
                  <Alert variant="success" className="mt-3">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...
                  </Alert>
                )}
              </Form>
            )}

            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary fw-500">
                <i className="bi bi-box-arrow-in-left me-2"></i>
                Quay lại Đăng nhập
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}