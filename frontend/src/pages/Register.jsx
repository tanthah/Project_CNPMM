import { useState, useRef, useEffect } from "react";
import { Container, Card, Form, InputGroup, Button, Alert, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setImageFile,
  clearImage,
  sendRegisterOtp,
  verifyRegisterOtp,
  completeRegistration,
  resetRegisterState,
  setStep
} from "../redux/registerSlice";
import {
  validateRegisterForm,
  validateOTP,
  validateImageFile,
  sanitizeFormData,
  validateGender,
  validateConfirmPassword,
  sanitizeInput
} from "../utils/validation";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading,
    message,
    error,
    imageFile,
    imagePreview,
    otpSent,
    otpVerified,
    registrationComplete,
    step
  } = useSelector((state) => state.register);

  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [formErrors, setFormErrors] = useState({});
  const otpInputsRef = useRef([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "other",
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    dispatch(resetRegisterState());
  }, [dispatch]);

  useEffect(() => {
    if (registrationComplete) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [registrationComplete, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Validate gender khi thay đổi
    if (name === "gender") {
      const genderError = validateGender(value);
      setFormErrors(prev => ({ ...prev, gender: genderError }));
    }

    // Validate confirmPassword realtime khi password đã có
    if (name === "confirmPassword" && form.password) {
      const confirmError = validateConfirmPassword(form.password, value);
      setFormErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }

    // Validate confirmPassword khi password thay đổi
    if (name === "password" && form.confirmPassword) {
      const confirmError = validateConfirmPassword(value, form.confirmPassword);
      setFormErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }

    // Clear error cho field này
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImageFile(file);
      if (error) {
        setFormErrors(prev => ({ ...prev, image: error }));
        return;
      }
      setFormErrors(prev => ({ ...prev, image: '' }));
      dispatch(setImageFile(file));
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});

    // Sanitize form data
    const sanitizedForm = sanitizeFormData(form);

    // Validate form
    const errors = validateRegisterForm(sanitizedForm);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await dispatch(sendRegisterOtp({ email: sanitizedForm.email })).unwrap();
    } catch (err) {
      // Error handled by slice
    }
  };

  // Step 2: Verify OTP
  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear OTP error khi user bắt đầu nhập
    if (formErrors.otp) {
      setFormErrors(prev => ({ ...prev, otp: '' }));
    }

    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const otpString = otp.join("");

    // Validate OTP
    const otpError = validateOTP(otpString);
    if (otpError) {
      setFormErrors({ otp: otpError });
      return;
    }

    // Sanitize OTP
    const sanitizedOtp = sanitizeInput(otpString);

    try {
      await dispatch(verifyRegisterOtp({
        email: form.email,
        otp: sanitizedOtp
      })).unwrap();

      // Sanitize toàn bộ form data trước khi hoàn tất đăng ký
      const sanitizedForm = sanitizeFormData(form);

      await dispatch(completeRegistration({
        ...sanitizedForm,
        otp: sanitizedOtp
      })).unwrap();

    } catch (err) {
      // Error handled by slice
    }
  };

  const handleResendOtp = () => {
    setOtp(Array(6).fill(""));
    setFormErrors({});
    dispatch(sendRegisterOtp({ email: form.email }));
  };

  const handleBackToForm = () => {
    dispatch(setStep(1));
    setOtp(Array(6).fill(""));
    setFormErrors({});
  };

  return (
    <Container className="mt-4 mb-4" style={{ maxWidth: "500px" }}>
      <Card className="shadow-lg">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4 fw-bold fs-4">
            {step === 1 && (
              <>
                <i className="bi bi-person-plus me-2"></i>
                Đăng ký tài khoản
              </>
            )}
            {step === 2 && (
              <>
                <i className="bi bi-shield-check me-2"></i>
                Xác thực OTP
              </>
            )}
            {step === 3 && (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Đăng ký thành công
              </>
            )}
          </h2>

          {error && (
            <Alert variant="danger" dismissible onClose={() => setFormErrors({})}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </Alert>
          )}
          {message && !error && (
            <Alert variant="success" dismissible>
              <i className="bi bi-check-circle me-2"></i>
              {message}
            </Alert>
          )}

          {formErrors.image && (
            <Alert variant="warning" dismissible onClose={() => setFormErrors(prev => ({ ...prev, image: '' }))}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              {formErrors.image}
            </Alert>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <Form onSubmit={handleSendOtp}>
              <div className="d-flex flex-column align-items-center mb-4">
                <div
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    overflow: "hidden",
                    backgroundColor: "#f8f9fa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "3px solid #0d6efd",
                    cursor: "pointer"
                  }}
                  onClick={triggerFileSelect}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="avatar preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-camera" style={{ fontSize: "2rem" }}></i>
                      <div style={{ fontSize: "0.8rem" }}>Chọn ảnh</div>
                    </div>
                  )}
                </div>

                <div className="mt-2 d-flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />

                  <Button size="sm" variant="outline-primary" onClick={triggerFileSelect}>
                    {imageFile ? "Đổi ảnh" : "Chọn ảnh"}
                  </Button>

                  {imageFile && (
                    <Button size="sm" variant="outline-danger" onClick={() => dispatch(clearImage())}>
                      Xóa
                    </Button>
                  )}
                </div>
                <small className="text-muted mt-1">Ảnh đại diện (tùy chọn, tối đa 5MB)</small>
              </div>

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-person me-2"></i>
                      Họ và tên <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      isInvalid={!!formErrors.name}
                      placeholder="Nhập họ và tên"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.name}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-envelope me-2"></i>
                      Email <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      isInvalid={!!formErrors.email}
                      placeholder="Nhập email"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.email}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-lock me-2"></i>
                      Mật khẩu <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        isInvalid={!!formErrors.password}
                        placeholder="Tối thiểu 8 ký tự"
                        className="pe-5"
                      />
                      <i
                        className={`
                          bi bi-eye${showPassword ? "-slash" : ""} 
                          position-absolute top-50 end-0 translate-middle-y me-3`
                        }
                        style={{ cursor: "pointer", zIndex: 10 }}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
                    </div>
                    <Form.Text className="text-muted">
                      <small>Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</small>
                    </Form.Text>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-lock-fill me-2"></i>
                      Nhập lại mật khẩu <span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        isInvalid={!!formErrors.confirmPassword}
                        placeholder="Nhập lại mật khẩu"
                        className="pe-5"
                      />
                      <i
                        className={`
                          bi bi-eye${showPassword ? "-slash" : ""} 
                          position-absolute top-50 end-0 translate-middle-y me-3`
                        }
                        style={{ cursor: "pointer", zIndex: 10 }}
                        onClick={() => setShowPassword(!showPassword)}
                      ></i>
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmPassword}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-telephone me-2"></i>
                      Số điện thoại
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      isInvalid={!!formErrors.phone}
                      placeholder="Nhập số điện thoại"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.phone}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-calendar-event me-2"></i>
                      Ngày sinh
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                      isInvalid={!!formErrors.dateOfBirth}
                    />
                    <Form.Control.Feedback type="invalid">
                      {formErrors.dateOfBirth}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-500 text-primary">
                      <i className="bi bi-gender-ambiguous me-2"></i>
                      Giới tính
                    </Form.Label>
                    <Form.Select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      isInvalid={!!formErrors.gender}
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formErrors.gender}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" className="w-100 mt-2" size="lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang gửi OTP...
                  </>
                ) : (
                  <>
                    <i className="bi bi-arrow-right-circle me-2"></i>
                    Tiếp tục
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
                onClick={() => {
                  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
                }}
                disabled={loading}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng ký với Google
              </Button>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="text-primary fw-500">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </Form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <div>
              <Alert variant="info" className="mb-4">
                <i className="bi bi-envelope me-2"></i>
                Mã OTP đã được gửi đến <strong>{form.email}</strong>
              </Alert>

              <p className="text-center text-muted mb-3">
                Vui lòng nhập mã OTP gồm 6 chữ số
              </p>

              <Form onSubmit={handleVerifyOtp}>
                <div className="d-flex justify-content-center gap-2 mb-4">
                  {otp.map((value, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      className="text-center fw-bold"
                      style={{
                        width: "50px",
                        height: "50px",
                        fontSize: "1.5rem",
                        borderRadius: "8px"
                      }}
                      maxLength={1}
                      value={value}
                      ref={(el) => (otpInputsRef.current[index] = el)}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      disabled={loading}
                      isInvalid={!!formErrors.otp && index === 5}
                    />
                  ))}
                </div>

                {formErrors.otp && (
                  <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {formErrors.otp}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 mb-3"
                  size="lg"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Xác nhận OTP
                    </>
                  )}
                </Button>

                <div className="d-flex justify-content-between">
                  <Button
                    variant="link"
                    onClick={handleBackToForm}
                    disabled={loading}
                    className="p-0"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Quay lại
                  </Button>
                  <Button
                    variant="link"
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Gửi lại OTP
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center py-4">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }}></i>
              </div>
              <h4 className="text-success mb-3">Đăng ký thành công!</h4>
              <p className="text-muted">Đang chuyển đến trang chủ...</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}