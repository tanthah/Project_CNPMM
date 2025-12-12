
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './css/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-main">
      <Container>
        <Row className="py-5">
          {/* Column 1: About */}
          <Col md={3} sm={6} className="mb-4">
            <h5 className="footer-heading">
              <i className="bi bi-shop me-2"></i>
              TV Shop
            </h5>
            <p className="text-muted small">
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
          <Col md={3} sm={6} className="mb-4">
            <h6 className="footer-heading">Hỗ trợ khách hàng</h6>
            <ul className="footer-links">
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/shipping">Chính sách vận chuyển</Link></li>
              <li><Link to="/warranty">Chính sách bảo hành</Link></li>
              <li><Link to="/return">Chính sách đổi trả</Link></li>
              <li><Link to="/payment">Hướng dẫn thanh toán</Link></li>
            </ul>
          </Col>

          {/* Column 3: Product Categories */}
          <Col md={3} sm={6} className="mb-4">
            <h6 className="footer-heading">Danh mục sản phẩm</h6>
            <ul className="footer-links">
              <li><Link to="/category/dien-thoai">Điện thoại</Link></li>
              <li><Link to="/category/laptop">Laptop</Link></li>
              <li><Link to="/category/tablet">Tablet</Link></li>
              <li><Link to="/category/tai-nghe">Tai nghe</Link></li>
              <li><Link to="/category/phu-kien">Phụ kiện</Link></li>
            </ul>
          </Col>

          {/* Column 4: Contact Info */}
          <Col md={3} sm={6} className="mb-4">
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
                <span>support@uteshop.com</span>
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
              <img src="/images/payment/visa.png" alt="Visa" className="payment-icon" />
              <img src="/images/payment/mastercard.png" alt="Mastercard" className="payment-icon" />
              <img src="/images/payment/momo.png" alt="Momo" className="payment-icon" />
              <img src="/images/payment/vnpay.png" alt="VNPay" className="payment-icon" />
              <img src="/images/payment/zalopay.png" alt="ZaloPay" className="payment-icon" />
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <h6 className="footer-heading small">Chứng nhận</h6>
            <div className="payment-methods">
              <img src="/images/certification/dmca.png" alt="DMCA" className="payment-icon" />
              <img src="/images/certification/bct.png" alt="BCT" className="payment-icon" />
            </div>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="py-3 border-top">
          <Col className="text-center">
            <p className="text-muted small mb-0">
              © 2025 TV Shop. All rights reserved. 
              <span className="mx-2">|</span>
              Made with <i className="bi bi-heart-fill text-danger"></i> by TV Students
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}