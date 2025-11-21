import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, verifyOtp, resetPassword, clearForgotPasswordState } from '../features/authSlice'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Form, Button, Alert, Card } from 'react-bootstrap'

export default function ForgotPassword() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, otpSent, otpVerified, resetSuccess } = useSelector((s) => s.auth)

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!email) return
    try {
      await dispatch(forgotPassword({ email })).unwrap()
    } catch (err) {
      // Error handled by slice
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) return
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap()
    } catch (err) {
      // Error handled by slice
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Mật khẩu không khớp!')
      return
    }
    try {
      await dispatch(resetPassword({ email, otp, newPassword })).unwrap()
    } catch (err) {
      // Error handled by slice
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <Card className="shadow-lg">
          <Card.Body className="p-5">
            <Card.Title className="text-center mb-4 fw-bold fs-4">Quên Mật khẩu</Card.Title>

            {/* Bước 1: Nhập Email */}
            {step === 1 && (
              <Form onSubmit={handleSendOtp}>
                <p className="text-muted mb-3">Nhập email của bạn để nhận mã OTP</p>
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
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100 fw-600"
                  size="lg"
                >
                  {loading ? 'Đang gửi...' : 'Gửi OTP'}
                </Button>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
              </Form>
            )}

            {/* Bước 2: Nhập OTP */}
            {step === 2 && (
              <Form onSubmit={handleVerifyOtp}>
                <Alert variant="success" className="mb-3">✅ OTP đã được gửi đến {email}</Alert>
                <p className="text-muted mb-3">Vui lòng kiểm tra email và nhập mã OTP (6 chữ số)</p>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">Mã OTP</Form.Label>
                  <Form.Control
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                    disabled={loading}
                    placeholder="Nhập 6 chữ số"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100 fw-600"
                  size="lg"
                >
                  {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </Button>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                <div className="mt-3">
                  <Button
                    variant="link"
                    onClick={() => {
                      setStep(1)
                      dispatch(clearForgotPasswordState())
                    }}
                    className="text-muted p-0"
                  >
                    ← Quay lại
                  </Button>
                </div>
              </Form>
            )}

            {/* Bước 3: Nhập mật khẩu mới */}
            {step === 3 && (
              <Form onSubmit={handleResetPassword}>
                <Alert variant="success" className="mb-3">✅ OTP hợp lệ</Alert>
                <p className="text-muted mb-3">Nhập mật khẩu mới của bạn</p>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">Mật khẩu mới</Form.Label>
                  <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength="6"
                    placeholder="Enter new password"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-500 text-primary">Xác nhận mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength="6"
                    placeholder="Confirm password"
                  />
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading}
                  className="w-100 fw-600"
                  size="lg"
                >
                  {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </Button>
                {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                {resetSuccess && (
                  <Alert variant="success" className="mt-3">
                    ✅ Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...
                  </Alert>
                )}
              </Form>
            )}

            <div className="mt-4 text-center">
              <Link to="/login" className="text-primary fw-500">Quay lại Đăng nhập</Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}