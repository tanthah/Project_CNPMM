// frontend/src/pages/Orders.jsx - ENHANCED WITH FILTERS
import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import orderApi from '../api/orderApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Orders.css';

export default function Orders() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [token, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders();
      setOrders(response.data.orders);
      setFilteredOrders(response.data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status) => {
    setActiveFilter(status);
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
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
      <Badge bg={statusInfo.bg} className="status-badge">
        <i className={`bi ${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
      </Badge>
    );
  };

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải đơn hàng...</p>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container className="py-4 orders-page">
        <h2 className="mb-4">
          <i className="bi bi-box-seam me-2"></i>
          Đơn hàng của tôi
        </h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Filter Tabs */}
        <Nav variant="pills" className="mb-4 order-filters">
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'all'} 
              onClick={() => filterOrders('all')}
            >
              Tất cả ({getStatusCount('all')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'new'} 
              onClick={() => filterOrders('new')}
            >
              Đơn mới ({getStatusCount('new')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'confirmed'} 
              onClick={() => filterOrders('confirmed')}
            >
              Đã xác nhận ({getStatusCount('confirmed')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'preparing'} 
              onClick={() => filterOrders('preparing')}
            >
              Chuẩn bị hàng ({getStatusCount('preparing')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'shipping'} 
              onClick={() => filterOrders('shipping')}
            >
              Đang giao ({getStatusCount('shipping')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'completed'} 
              onClick={() => filterOrders('completed')}
            >
              Hoàn thành ({getStatusCount('completed')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link 
              active={activeFilter === 'cancelled'} 
              onClick={() => filterOrders('cancelled')}
            >
              Đã hủy ({getStatusCount('cancelled')})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h4 className="mt-3 text-muted">
              {activeFilter === 'all' 
                ? 'Bạn chưa có đơn hàng nào' 
                : `Không có đơn hàng nào ở trạng thái này`}
            </h4>
            <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
              <i className="bi bi-arrow-left me-2"></i>
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <>
            {filteredOrders.map((order) => (
              <Card key={order._id} className="mb-3 order-card">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Mã đơn: {order.orderCode}</strong>
                    <span className="text-muted ms-3">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    {getStatusBadge(order.status)}
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="order-items mb-3">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item._id} className="d-flex align-items-center mb-2">
                        <img 
                          src={item.productId?.images?.[0] || 'https://via.placeholder.com/60'} 
                          alt={item.productId?.name || 'Product'}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                          onClick={() => item.productId && navigate(`/product/${item.productId._id}`)}
                        />
                        <div className="flex-grow-1 ms-3">
                          <div>{item.productId?.name || 'Sản phẩm đã bị xóa'}</div>
                          <small className="text-muted">
                            x{item.quantity} | {item.price.toLocaleString('vi-VN')}đ
                          </small>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <small className="text-muted">
                        và {order.items.length - 2} sản phẩm khác...
                      </small>
                    )}
                  </div>

                  {/* Status message */}
                  {order.status === 'cancel_requested' && (
                    <Alert variant="warning" className="mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Yêu cầu hủy đơn đang được xem xét
                    </Alert>
                  )}

                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Tổng tiền:</strong>{' '}
                      <span className="text-danger fs-5">
                        {order.totalPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => navigate(`/orders/${order._id}`)}
                    >
                      <i className="bi bi-eye me-1"></i>
                      Xem chi tiết
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </>
        )}
      </Container>
      <Footer />
    </>
  );
}