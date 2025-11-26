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

  // Reset state when component mounts
  useEffect(() => {
    dispatch(resetRegisterState());
  }, [dispatch]);

  // Navigate to dashboard after successful registration
  useEffect(() => {
    if (registrationComplete) {
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [registrationComplete, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      dispatch(setImageFile(file));
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Mật khẩu nhập lại không khớp!");
      return;
    }

    if (form.password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    try {
      await dispatch(sendRegisterOtp({ email: form.email })).unwrap();
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

    // Auto focus next input
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
    const otpString = otp.join("");

    if (otpString.length !== 6) {
      alert("Vui lòng nhập đầy đủ 6 số OTP!");
      return;
    }

    try {
      await dispatch(verifyRegisterOtp({ 
        email: form.email, 
        otp: otpString 
      })).unwrap();

      // Complete registration after OTP verified
      await dispatch(completeRegistration({
        ...form,
        otp: otpString
      })).unwrap();

    } catch (err) {
      // Error handled by slice
    }
  };

  const handleResendOtp = () => {
    setOtp(Array(6).fill(""));
    dispatch(sendRegisterOtp({ email: form.email }));
  };

  const handleBackToForm = () => {
    dispatch(setStep(1));
    setOtp(Array(6).fill(""));
  };

  return (
    <Container className="mt-4 mb-4" style={{ maxWidth: "500px" }}>
      <Card className="shadow-lg">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">
            {step === 1 && "Đăng ký tài khoản"}
            {step === 2 && "Xác thực OTP"}
            {step === 3 && "Đăng ký thành công"}
          </h2>

          {/* Display messages */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => dispatch(clearMessage())}>
              {error}
            </Alert>
          )}
          {message && !error && (
            <Alert variant="success" dismissible onClose={() => dispatch(clearMessage())}>
              {message}
            </Alert>
          )}

          {/* Step 1: Registration Form */}
          {step === 1 && (
            <Form onSubmit={handleSendOtp}>
              {/* Avatar preview */}
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
                    <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Nhập họ và tên"
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="Nhập email"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu <span className="text-danger">*</span></Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength="6"
                        placeholder="Tối thiểu 6 ký tự"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nhập lại mật khẩu <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Nhập lại mật khẩu"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Số điện thoại</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="phone" 
                      value={form.phone} 
                      onChange={handleChange}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Ngày sinh</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={form.dateOfBirth}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Giới tính</Form.Label>
                    <Form.Select name="gender" value={form.gender} onChange={handleChange}>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Button type="submit" className="w-100 mt-2" size="lg" disabled={loading}>
                {loading ? "Đang gửi OTP..." : "Tiếp tục"}
              </Button>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Đã có tài khoản?{" "}
                  <Link to="/login" className="text-primary fw-500">
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
                    />
                  ))}
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 mb-3" 
                  size="lg"
                  disabled={loading || otp.join("").length !== 6}
                >
                  {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                </Button>

                <div className="d-flex justify-content-between">
                  <Button 
                    variant="link" 
                    onClick={handleBackToForm}
                    disabled={loading}
                    className="p-0"
                  >
                    ← Quay lại
                  </Button>
                  <Button 
                    variant="link" 
                    onClick={handleResendOtp}
                    disabled={loading}
                  >
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