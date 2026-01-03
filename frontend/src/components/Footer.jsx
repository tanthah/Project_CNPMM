
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './css/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-main">
      <Container fluid>
        <Row className="py-5">
          {/* Column 1: About */}
          <Col md={4} sm={6} className="mb-4">
            <h5 className="footer-heading">
              <i className="bi bi-shop me-2"></i>
              TV Shop
            </h5>
            <p className="small" style={{ color: '#ffffff' }}>
              Hệ thống bán lẻ điện thoại, laptop, tablet và phụ kiện chính hãng uy tín hàng đầu Việt Nam.
            </p>
            <div className="social-links">
              <a href="#" className="social-link">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-link">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-link">
                <i className="bi bi-youtube"></i>
              </a>
              <a href="#" className="social-link">
                <i className="bi bi-tiktok"></i>
              </a>
            </div>
          </Col>

          {/* Column 2: Customer Support */}
          <Col md={4} sm={6} className="mb-4">
            <h6 className="footer-heading">Hỗ trợ khách hàng</h6>
            <ul className="footer-links">
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
              <li><Link to="/warranty">Chính sách bảo hành</Link></li>
              <li><Link to="/return">Chính sách đổi trả</Link></li>
              <li><Link to="/payment">Hướng dẫn thanh toán</Link></li>
            </ul>
          </Col>

          {/* Column 3: Contact Info */}
          <Col md={4} sm={6} className="mb-4">
            <h6 className="footer-heading">Thông tin liên hệ</h6>
            <ul className="footer-contact">
              <li>
                <i className="bi bi-geo-alt-fill me-2"></i>
                <span>1 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM</span>
              </li>
              <li>
                <i className="bi bi-telephone-fill me-2"></i>
                <span>Hotline: 1900 xxxx</span>
              </li>
              <li>
                <i className="bi bi-envelope-fill me-2"></i>
                <span>support@tvshop.com</span>
              </li>
              <li>
                <i className="bi bi-clock-fill me-2"></i>
                <span>8:00 - 22:00 (Cả tuần)</span>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Payment Methods */}
        <Row className="py-3 border-top">
          <Col md={6} className="mb-3">
            <h6 className="footer-heading small">Phương thức thanh toán</h6>
            <div className="payment-methods">
              <img src="" alt="Visa" className="payment-icon" />
              <img src="" alt="Mastercard" className="payment-icon" />
              <img src="" alt="Momo" className="payment-icon" />
              <img src="" alt="VNPay" className="payment-icon" />
              <img src="" alt="ZaloPay" className="payment-icon" />
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <h6 className="footer-heading small">Chứng nhận</h6>
            <div className="payment-methods">
              <img src="" alt="DMCA" className="payment-icon" />
              <img src="" alt="BCT" className="payment-icon" />
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="py-3 border-top">
          <Col className="text-center">
            <p className="small mb-0" style={{ color: '#ffffff' }}>
              © 2025 TV Shop. All rights reserved.
              <span className="mx-2">|</span>
              Made by TV team Students
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
