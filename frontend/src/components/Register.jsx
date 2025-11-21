import { useState } from "react";


export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    dateOfBirth: "",
    gender: "other",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessage("Mật khẩu nhập lại không khớp!");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Đăng ký thất bại!");
        setLoading(false);
        return;
      }

      setMessage("🎉 Đăng ký thành công! Hãy đăng nhập.");
      setLoading(false);
    } catch (err) {
      setMessage("❌ Lỗi server!");
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "450px" }}>
      <div className="card shadow">
        <div className="card-body p-4">

          <h2 className="text-center mb-4">Register</h2>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-3">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="form-control"
              />
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="form-label">Mật khẩu</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-3">
              <label className="form-label">Nhập lại mật khẩu</label>
              <div className="input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Ẩn" : "Hiện"}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="mb-3">
              <label className="form-label">Số điện thoại</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Date */}
            <div className="mb-3">
              <label className="form-label">Ngày sinh</label>
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            {/* Gender */}
            <div className="mb-3">
              <label className="form-label">Giới tính</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Message */}
            {message && (
              <p
                className={
                  "text-center fw-bold " +
                  (message.includes("thành công") ? "text-success" : "text-danger")
                }
              >
                {message}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 mt-2"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>

            
          </form>

          

        </div>
      </div>
    </div>
  );
}
