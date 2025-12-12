// frontend/src/pages/Reviews.jsx
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Nav, Card, Button, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPendingReviews, fetchUserReviews } from '../redux/reviewSlice';
import { ReviewForm } from '../components/ReviewForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Reviews.css';

export default function Reviews() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { pendingReviews, userReviews, loading, error } = useSelector((s) => s.review);
  
  const [activeTab, setActiveTab] = useState('pending');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (activeTab === 'pending') {
      dispatch(fetchPendingReviews());
    } else {
      dispatch(fetchUserReviews({ page: 1, limit: 20 }));
    }
  }, [dispatch, token, navigate, activeTab]);

  const handleReviewClick = (orderItem) => {
    setSelectedProduct(orderItem);
    setShowReviewForm(true);
  };

  return (
    <>
      <Header />
      
      <Container className="py-4 reviews-page">
        <h2 className="mb-4">
          <i className="bi bi-star me-2"></i>
          Đánh giá của tôi
        </h2>

        {error && (
          <Alert variant="danger" dismissible>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Nav variant="pills" className="mb-4">
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
            >
              <i className="bi bi-clock-history me-2"></i>
              Chờ đánh giá ({pendingReviews.length})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
            >
              <i className="bi bi-check-circle me-2"></i>
              Đã đánh giá ({userReviews.length})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-3">Đang tải...</p>
          </div>
        ) : (
          <>
            {/* Pending Reviews Tab */}
            {activeTab === 'pending' && (
              <>
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '5rem', color: '#ccc' }}></i>
                    <h4 className="mt-3">Không có sản phẩm nào cần đánh giá</h4>
                    <p className="text-muted">
                      Các sản phẩm từ đơn hàng hoàn thành sẽ xuất hiện ở đây
                    </p>
                    <Button variant="primary" onClick={() => navigate('/orders')}>
                      <i className="bi bi-box-seam me-2"></i>
                      Xem đơn hàng
                    </Button>
                  </div>
                ) : (
                  <Row>
                    {pendingReviews.map((item, idx) => (
                      <Col key={`${item.orderId || 'noorder'}-${item.product._id}-${idx}`} md={6} lg={4} className="mb-3">
                        <Card className="h-100 pending-review-card">
                          <Card.Body>
                            <div className="d-flex align-items-start mb-3">
                              <img 
                                src={item.product.images[0]}
                                alt={item.product.name}
                                style={{ 
                                  width: '80px', 
                                  height: '80px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px' 
                                }}
                              />
                              <div className="ms-3 flex-grow-1">
                                <h6 className="mb-1">{item.product.name}</h6>
                                <div className="text-muted small">
                                  Mã đơn: {item.orderCode}
                                </div>
                                <div className="text-success small">
                                  <i className="bi bi-check-circle me-1"></i>
                                  Hoàn thành: {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              variant="primary"
                              className="w-100"
                              onClick={() => handleReviewClick(item)}
                              disabled={!item.orderId}
                            >
                              <i className="bi bi-pencil-square me-2"></i>
                              Đánh giá ngay
                            </Button>
                            
                            <div className="text-center mt-2">
                              <small className="text-muted">
                                <i className="bi bi-gift me-1"></i>
                                Nhận 50 điểm + Mã giảm giá 5%
                              </small>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            )}

            {/* Completed Reviews Tab */}
            {activeTab === 'completed' && (
              <>
                {userReviews.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-chat-left-text" style={{ fontSize: '5rem', color: '#ccc' }}></i>
                    <h4 className="mt-3">Chưa có đánh giá nào</h4>
                    <p className="text-muted">
                      Các đánh giá của bạn sẽ xuất hiện ở đây
                    </p>
                  </div>
                ) : (
                  <div>
                    {userReviews.map((review) => (
                      <Card key={review._id} className="mb-3 review-item-card">
                        <Card.Body>
                          <Row>
                            <Col md={3}>
                              <img 
                                src={review.productId?.images?.[0] || 'https://via.placeholder.com/100'}
                                alt={review.productId?.name}
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '150px',
                                  height: '150px', 
                                  objectFit: 'cover', 
                                  borderRadius: '8px' 
                                }}
                              />
                            </Col>
                            
                            <Col md={9}>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h5 className="mb-1">{review.productId?.name}</h5>
                                  <div className="text-warning">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <i 
                                        key={star}
                                        className={star <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'}
                                      ></i>
                                    ))}
                                  </div>
                                </div>
                                <small className="text-muted">
                                  {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                </small>
                              </div>
                              
                              <p className="mb-2">{review.comment || 'Không có nhận xét'}</p>
                              
                              <div className="d-flex justify-content-between align-items-center">
                                <div>
                                  <Badge bg="success" className="me-2">
                                    <i className="bi bi-patch-check me-1"></i>
                                    Đã mua hàng
                                  </Badge>
                                  <small className="text-muted">
                                    Đơn hàng: {review.orderId?.orderCode}
                                  </small>
                                </div>
                                
                                <div>
                                  <Button 
                                    variant="outline-secondary" 
                                    size="sm"
                                    onClick={() => navigate(`/product/${review.productId._id}`)}
                                  >
                                    <i className="bi bi-box-seam me-1"></i>
                                    Xem sản phẩm
                                  </Button>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Container>

      {/* Review Form Modal */}
      {selectedProduct && (
        <ReviewForm 
          show={showReviewForm}
          onHide={() => {
            setShowReviewForm(false);
            setSelectedProduct(null);
          }}
          orderItem={selectedProduct}
        />
      )}

      <Footer />
    </>
  );
}
