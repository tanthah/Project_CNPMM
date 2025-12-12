// frontend/src/pages/OrderDetail.jsx - ENHANCED WITH TIMELINE
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import orderApi from '../api/orderApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/OrderDetail.css';
import { useNotification } from '../components/NotificationProvider';

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const notify = useNotification();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadOrderDetail();
  }, [orderId, token, navigate]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getOrderDetail(orderId);
      setOrder(response.data.order);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      notify.info('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      setCancelling(true);
      await orderApi.cancelOrder(orderId, cancelReason);
      await loadOrderDetail();
      setShowCancelModal(false);
      setCancelReason('');
      notify.success('Đã gửi yêu cầu hủy đơn thành công');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Lỗi khi hủy đơn hàng');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { bg: 'info', text: 'Đơn hàng mới', icon: 'bi-clock-history' },
      confirmed: { bg: 'primary', text: 'Đã xác nhận', icon: 'bi-check-circle' },
      preparing: { bg: 'warning', text: 'Đang chuẩn bị', icon: 'bi-box-seam' },
      shipping: { bg: 'info', text: 'Đang giao', icon: 'bi-truck' },
      completed: { bg: 'success', text: 'Hoàn thành', icon: 'bi-check-circle-fill' },
      cancelled: { bg: 'danger', text: 'Đã hủy', icon: 'bi-x-circle' },
      cancel_requested: { bg: 'secondary', text: 'Yêu cầu hủy', icon: 'bi-exclamation-triangle' }
    };
    const statusInfo = statusMap[status] || { bg: 'secondary', text: status, icon: 'bi-question-circle' };
    return (
      <Badge bg={statusInfo.bg} className="p-2">
        <i className={`bi ${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
      </Badge>
    );
  };

  const getTimeRemaining = () => {
    if (!order || !order.cancellationInfo?.cancelDeadline) return null;
    
    const deadline = new Date(order.cancellationInfo.cancelDeadline);
    const now = new Date();
    const diff = deadline - now;
    
    if (diff <= 0) return null;
    
    const minutes = Math.floor(diff / 1000 / 60);
    return `${minutes} phút`;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải thông tin đơn hàng...</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Header />
        <Container className="py-5">
          <Alert variant="danger">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error || 'Không tìm thấy đơn hàng'}
          </Alert>
          <Button variant="primary" onClick={() => navigate('/orders')}>
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại danh sách đơn hàng
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const timeRemaining = getTimeRemaining();
  const canCancel = order.status === 'new' || order.status === 'confirmed' || order.status === 'preparing';
  const canDirectCancel = (order.status === 'new' || order.status === 'confirmed') && timeRemaining;

  return (
    <>
      <Header />
      <Container className="py-4 order-detail-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-receipt me-2"></i>
            Chi tiết đơn hàng
          </h2>
          <Button variant="outline-secondary" onClick={() => navigate('/orders')}>
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </Button>
        </div>

        <Row>
          <Col lg={8}>
            {/* Order Status */}
            <Card className="mb-3">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">Mã đơn hàng: {order.orderCode}</h5>
                  <small className="text-muted">
                    Đặt ngày: {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </small>
                </div>
                {getStatusBadge(order.status)}
              </Card.Header>
              <Card.Body>
                {/* Enhanced Timeline */}
                <div className="order-timeline">
                  <div className={`timeline-item ${order.status !== 'cancelled' ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Đơn hàng đã đặt</div>
                      {order.createdAt && (
                        <div className="timeline-time">
                          {new Date(order.createdAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`timeline-item ${['confirmed', 'preparing', 'shipping', 'completed'].includes(order.status) ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Đã xác nhận</div>
                      {order.confirmedAt && (
                        <div className="timeline-time">
                          {new Date(order.confirmedAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`timeline-item ${['preparing', 'shipping', 'completed'].includes(order.status) ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <i className="bi bi-box-seam"></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Đang chuẩn bị hàng</div>
                      {order.preparingAt && (
                        <div className="timeline-time">
                          {new Date(order.preparingAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`timeline-item ${['shipping', 'completed'].includes(order.status) ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <i className="bi bi-truck"></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Đang giao hàng</div>
                      {order.shippingAt && (
                        <div className="timeline-time">
                          {new Date(order.shippingAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`timeline-item ${order.status === 'completed' ? 'active' : ''}`}>
                    <div className="timeline-marker">
                      <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">Đã giao hàng</div>
                      {order.completedAt && (
                        <div className="timeline-time">
                          {new Date(order.completedAt).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cancel request info */}
                {order.status === 'cancel_requested' && (
                  <Alert variant="warning" className="mt-3">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Yêu cầu hủy đơn đang được xem xét</strong>
                    <div className="mt-2">
                      Lý do: {order.cancelReason}
                    </div>
                  </Alert>
                )}

                {/* Cancelled info */}
                {order.status === 'cancelled' && order.cancelReason && (
                  <Alert variant="danger" className="mt-3">
                    <i className="bi bi-x-circle me-2"></i>
                    <strong>Đơn hàng đã bị hủy</strong>
                    <div className="mt-2">
                      Lý do: {order.cancelReason}
                    </div>
                    {order.cancelledAt && (
                      <div className="text-muted small mt-1">
                        Hủy lúc: {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                      </div>
                    )}
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Products */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-box-seam me-2"></i>
                  Sản phẩm ({order.items.length})
                </h5>
              </Card.Header>
              <Card.Body>
                {order.items.map((item) => (
                  <div key={item._id} className="product-item d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img 
                      src={item.productId?.images?.[0] || 'https://via.placeholder.com/100'} 
                      alt={item.productId?.name || 'Product'}
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                      onClick={() => item.productId && navigate(`/product/${item.productId._id}`)}
                    />
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">{item.productId?.name || 'Sản phẩm đã bị xóa'}</h6>
                      <div className="text-muted">Số lượng: x{item.quantity}</div>
                      <div className="text-danger fw-bold">
                        {item.price.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                    <div className="text-end">
                      <strong className="text-primary">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                      </strong>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Delivery Address */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Địa chỉ giao hàng
                </h5>
              </Card.Header>
              <Card.Body>
                {order.addressId ? (
                  <>
                    <div className="fw-bold mb-1">{order.addressId.fullName}</div>
                    <div className="text-muted mb-1">
                      <i className="bi bi-telephone me-2"></i>
                      {order.addressId.phone}
                    </div>
                    <div className="text-muted">
                      <i className="bi bi-geo-alt me-2"></i>
                      {order.addressId.addressLine}, {order.addressId.ward}, {order.addressId.district}, {order.addressId.city}
                    </div>
                  </>
                ) : (
                  <p className="text-muted">Không có thông tin địa chỉ</p>
                )}
              </Card.Body>
            </Card>

            {/* Notes */}
            {order.notes && (
              <Card className="mb-3">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">
                    <i className="bi bi-chat-left-text me-2"></i>
                    Ghi chú
                  </h5>
                </Card.Header>
                <Card.Body>
                  <p className="mb-0 text-muted">{order.notes}</p>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col lg={4}>
            {/* Order Summary */}
            <Card className="sticky-top " style={{ top: '100px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Thông tin thanh toán</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>
                    {(order.totalPrice - order.shippingFee).toLocaleString('vi-VN')}đ
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong>{order.shippingFee.toLocaleString('vi-VN')}đ</strong>
                </div>
                {order.discount > 0 && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Giảm giá:</span>
                    <strong className="text-success">
                      -{order.discount.toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {order.totalPrice.toLocaleString('vi-VN')}đ
                  </h5>
                </div>

                <div className="alert alert-info mb-3">
                  <i className="bi bi-credit-card me-2"></i>
                  <strong>Phương thức:</strong> {order.paymentMethod || 'COD'}
                </div>

                {/* Time remaining for cancel */}
                {canDirectCancel && timeRemaining && (
                  <Alert variant="warning" className="mb-3">
                    <i className="bi bi-clock me-2"></i>
                    <small>Còn <strong>{timeRemaining}</strong> để hủy đơn miễn phí</small>
                  </Alert>
                )}

                {/* Cancel button */}
                {canCancel && order.status !== 'cancel_requested' && (
                  <Button
                    variant="danger"
                    className="w-100"
                    onClick={() => setShowCancelModal(true)}
                    disabled={cancelling}
                  >
                    {canDirectCancel ? (
                      <>
                        <i className="bi bi-x-circle me-2"></i>
                        Hủy đơn hàng
                      </>
                    ) : (
                      <>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Gửi yêu cầu hủy
                      </>
                    )}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Cancel Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {canDirectCancel ? 'Xác nhận hủy đơn hàng' : 'Gửi yêu cầu hủy đơn'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Lý do hủy <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Vui lòng nhập lý do hủy đơn..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
          {!canDirectCancel && (
            <Alert variant="info" className="mt-3 mb-0">
              <i className="bi bi-info-circle me-2"></i>
              <small>
                Đơn hàng đang được chuẩn bị. Yêu cầu hủy sẽ được shop xem xét và phản hồi sớm nhất.
              </small>
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Đóng
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelOrder}
            disabled={cancelling || !cancelReason.trim()}
          >
            {cancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check me-2"></i>
                Xác nhận
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
}
