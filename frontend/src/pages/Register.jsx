import { useState, useRef } from "react";
import { Container, Card, Form, InputGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, setImageFile, clearImage } from "../redux/registerSlice";

export default function Register() {
  const dispatch = useDispatch();

  const { loading, message, error, imageFile, imagePreview } = useSelector(
    (state) => state.auth
  );

  const [showPassword, setShowPassword] = useState(false);

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    dispatch(setImageFile(file));
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(registerUser({ form, imageFile }));
  };

  return (
    <Container className="mt-4" style={{ maxWidth: "450px" }}>
      <Card className="shadow">
        <Card.Body className="p-4">
          <h2 className="text-center mb-4">Register</h2>

          <Form onSubmit={handleSubmit}>
            {/* Avatar preview */}
            <div className="d-flex flex-column align-items-center mb-3">
              <div
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#f1f1f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #e0e0e0",
                }}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="avatar preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ color: "#888" }}>Ảnh đại diện</span>
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

                <Button variant="outline-primary" onClick={triggerFileSelect}>
                  Chọn ảnh
                </Button>

                {imageFile && (
                  <Button variant="outline-danger" onClick={() => dispatch(clearImage())}>
                    Xóa
                  </Button>
                )}
              </div>
            </div>

            {/* Name */}
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Email */}
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Password */}
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group className="mb-3">
              <Form.Label>Nhập lại mật khẩu</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Phone */}
            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control type="text" name="phone" value={form.phone} onChange={handleChange} />
            </Form.Group>

            {/* Date */}
            <Form.Group className="mb-3">
              <Form.Label>Ngày sinh</Form.Label>
              <Form.Control
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </Form.Group>

            {/* Gender */}
            <Form.Group className="mb-3">
              <Form.Label>Giới tính</Form.Label>
              <Form.Select name="gender" value={form.gender} onChange={handleChange}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" className="w-100 mt-2" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>

            <div className="text-center mt-4">
              <p className="mb-2">
                Đã có tài khoản?{" "}
                <Link to="/login" className="text-primary fw-500">
                  Đăng nhập
                </Link>
              </p>

              {message && <p className="text-success">{message}</p>}
              {error && <p className="text-danger">{error}</p>}
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
