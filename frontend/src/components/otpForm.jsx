import React, { useRef, useState } from "react";
import { Form, Button, Row, Col, Card } from "react-bootstrap";

export default function OtpForm({ onSubmit }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    if (isNaN(value)) return; // chỉ cho phép số

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // tự nhảy sang ô kế tiếp
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Backspace → lùi về ô trước
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(otp.join("")); // gửi OTP dạng "123456"
  };

  return (
    <Row className="justify-content-center mt-4">
      <Col md={0}>
        <Card className="p-4 shadow-sm">
          <h3 className="text-center mb-3">Nhập mã OTP</h3>
          <p className="text-center text-muted">
            Mã xác thực đã được gửi đến email của bạn
          </p>

          <Form onSubmit={handleSubmit}>
            <div className="d-flex justify-content-between mb-3">
              {otp.map((value, index) => (
                <Form.Control
                  key={index}
                  type="text"
                  className="text-center"
                  style={{ width: "50px", fontSize: "1.5rem" }}
                  maxLength={1}
                  value={value}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            <Button type="submit" variant="primary" className="w-100">
              Xác nhận
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
