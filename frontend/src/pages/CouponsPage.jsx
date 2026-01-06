import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/coupons/public`);
                setCoupons(res.data.coupons || []);
            } catch (err) {
                setError('Không thể tải danh sách mã giảm giá');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="d-flex flex-column min-vh-100">
            <Header />
            <Container className="py-5 flex-grow-1">
                <div className="text-center mb-5">
                    <h1 className="fw-bold text-primary mb-3">Kho Mã Giảm Giá</h1>
                    <p className="text-muted lead">Săn ngay mã giảm giá hot nhất tại TV Shop</p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-5">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/4076/4076432.png"
                            alt="Empty"
                            style={{ width: 120, opacity: 0.5 }}
                            className="mb-3"
                        />
                        <h4 className="text-muted">Chưa có mã giảm giá nào</h4>
                    </div>
                ) : (
                    <Row>
                        {coupons.map(coupon => (
                            <Col key={coupon._id} md={6} lg={4} className="mb-4">
                                <Card className="h-100 shadow-sm border-0 coupon-card">
                                    <Card.Body className="d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div>
                                                <h4 className="fw-bold text-primary mb-1">{coupon.code}</h4>
                                                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">
                                                    {coupon.type === 'percentage' ? `Giảm ${coupon.value}%` : `Giảm ${coupon.value.toLocaleString()}đ`}
                                                </span>
                                            </div>
                                            <i className="bi bi-ticket-perforated fs-1 text-black-50"></i>
                                        </div>

                                        <div className="mb-4 flex-grow-1">
                                            <p className="text-muted mb-2 small">
                                                <i className="bi bi-cart me-2"></i>
                                                Đơn tối thiểu: {coupon.minOrderValue ? coupon.minOrderValue.toLocaleString() + 'đ' : '0đ'}
                                            </p>
                                            <p className="text-muted mb-0 small">
                                                <i className="bi bi-clock me-2"></i>
                                                Hạn dùng: {new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>

                                        <Button
                                            variant={copiedId === coupon._id ? "success" : "outline-primary"}
                                            className="w-100 fw-bold py-2"
                                            onClick={() => handleCopy(coupon.code, coupon._id)}
                                        >
                                            {copiedId === coupon._id ? (
                                                <>
                                                    <i className="bi bi-check-lg me-2"></i>Đã sao chép
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-clipboard me-2"></i>Sao chép mã
                                                </>
                                            )}
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
            <Footer />

            <style>{`
        .coupon-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .coupon-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
        }
      `}</style>
        </div>
    );
}
