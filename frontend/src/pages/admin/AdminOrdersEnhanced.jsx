// frontend/src/pages/admin/AdminOrdersEnhanced.jsx
// Thay thế file AdminOrders.jsx cũ bằng file này
import React, { useEffect, useState } from 'react';
import { Container, Card, Badge, Button, Spinner, Alert, Nav, Modal, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import orderApi from '../../api/orderApi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { QuickOrderActions, TestOrderGenerator, BulkOrderUpdate } from '../../components/admin/QuickOrderActions';
import '../css/AdminOrders.css';
import { useNotification } from '../../components/NotificationProvider';

export default function AdminOrdersEnhanced() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const notify = useNotification();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Bulk selection
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [cancelAction, setCancelAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Check if user is admin
    if (user?.role !== 'admin') {
      notify.error('Bạn không có quyền truy cập trang này!');
      navigate('/');
      return;
    }
    
    loadAllOrders();
  }, [token, user, navigate]);

  const loadAllOrders = async () => {
    try {
      setLoading(true);
      const response = await orderApi.getUserOrders();
      const allOrders = response.data.orders;
      
      // Sort by newest first
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(allOrders);
      setFilteredOrders(allOrders);
      setSelectedOrders([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = (status) => {
    setActiveFilter(status);
    setSelectedOrders([]);
    
    if (status === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === status));
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    return orders.filter(order => order.status === status).length;
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
      <Badge bg={statusInfo.bg}>
        <i className={`bi ${statusInfo.icon} me-1`}></i>
        {statusInfo.text}
      </Badge>
    );
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const eligibleOrders = filteredOrders.filter(
        order => order.status !== 'completed' && order.status !== 'cancelled'
      );
      setSelectedOrders(eligibleOrders.map(order => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      notify.info('Vui lòng chọn trạng thái mới');
      return;
    }

    try {
      setUpdating(true);
      await orderApi.updateOrderStatus(selectedOrder._id, newStatus, statusNote);
      await loadAllOrders();
      setShowStatusModal(false);
      setSelectedOrder(null);
      setNewStatus('');
      setStatusNote('');
      notify.success('Cập nhật trạng thái thành công!');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelAction) {
      notify.info('Vui lòng chọn hành động');
      return;
    }

    if (cancelAction === 'reject' && !rejectionReason.trim()) {
      notify.info('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setUpdating(true);
      await orderApi.handleCancelRequest(selectedOrder._id, cancelAction, rejectionReason);
      await loadAllOrders();
      setShowCancelModal(false);
      setSelectedOrder(null);
      setCancelAction('');
      setRejectionReason('');
      notify.success(cancelAction === 'approve' ? 'Đã chấp thuận yêu cầu hủy' : 'Đã từ chối yêu cầu hủy');
    } catch (err) {
      notify.error(err.response?.data?.message || 'Lỗi khi xử lý yêu cầu');
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus('');
    setStatusNote('');
    setShowStatusModal(true);
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelAction('');
    setRejectionReason('');
    setShowCancelModal(true);
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

  const selectedOrderObjects = orders.filter(order => selectedOrders.includes(order._id));

  return (
    <>
      <Header />
      <Container className="py-4 admin-orders-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-shield-check me-2"></i>
            Quản lý đơn hàng (Admin)
          </h2>
          <Button variant="outline-secondary" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left me-2"></i>
            Về trang chủ
          </Button>
        </div>

        {/* Test Order Generator */}
        <TestOrderGenerator onGenerate={loadAllOrders} />

        {/* Bulk Update Actions */}
        <BulkOrderUpdate 
          selectedOrders={selectedOrderObjects}
          onUpdate={loadAllOrders}
        />

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Filter Tabs */}
        <Nav variant="pills" className="mb-4 order-filters">
          <Nav.Item>
            <Nav.Link active={activeFilter === 'all'} onClick={() => filterOrders('all')}>
              Tất cả ({getStatusCount('all')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'new'} onClick={() => filterOrders('new')}>
              Đơn mới ({getStatusCount('new')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'cancel_requested'} onClick={() => filterOrders('cancel_requested')}>
              Yêu cầu hủy ({getStatusCount('cancel_requested')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'confirmed'} onClick={() => filterOrders('confirmed')}>
              Đã xác nhận ({getStatusCount('confirmed')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'preparing'} onClick={() => filterOrders('preparing')}>
              Chuẩn bị hàng ({getStatusCount('preparing')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'shipping'} onClick={() => filterOrders('shipping')}>
              Đang giao ({getStatusCount('shipping')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'completed'} onClick={() => filterOrders('completed')}>
              Hoàn thành ({getStatusCount('completed')})
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-inbox" style={{ fontSize: '5rem', color: '#ccc' }}></i>
            <h4 className="mt-3">Không có đơn hàng nào</h4>
          </div>
        ) : (
          <Card>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>
                      <Form.Check
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedOrders.length === filteredOrders.filter(
                          order => order.status !== 'completed' && order.status !== 'cancelled'
                        ).length && filteredOrders.filter(
                          order => order.status !== 'completed' && order.status !== 'cancelled'
                        ).length > 0}
                      />
                    </th>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác nhanh</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <Form.Check
                            type="checkbox"
                            checked={selectedOrders.includes(order._id)}
                            onChange={() => handleSelectOrder(order._id)}
                          />
                        )}
                      </td>
                      <td>
                        <strong>{order.orderCode}</strong>
                      </td>
                      <td>
                        {order.addressId?.fullName || 'N/A'}
                        <br />
                        <small className="text-muted">{order.addressId?.phone}</small>
                      </td>
                      <td>
                        <small>{new Date(order.createdAt).toLocaleString('vi-VN')}</small>
                      </td>
                      <td>
                        <strong className="text-danger">
                          {order.totalPrice.toLocaleString('vi-VN')}đ
                        </strong>
                      </td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <QuickOrderActions 
                          order={order}
                          onUpdate={loadAllOrders}
                        />
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => navigate(`/orders/${order._id}`)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          
                          {order.status === 'cancel_requested' ? (
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => openCancelModal(order)}
                            >
                              <i className="bi bi-exclamation-triangle"></i>
                            </Button>
                          ) : (
                            order.status !== 'cancelled' && order.status !== 'completed' && (
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => openStatusModal(order)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Đơn hàng:</strong> {selectedOrder.orderCode}
                <br />
                <strong>Trạng thái hiện tại:</strong> {getStatusBadge(selectedOrder.status)}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái mới <span className="text-danger">*</span></Form.Label>
                <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="">-- Chọn trạng thái --</option>
                  {selectedOrder.status === 'new' && (
                    <>
                      <option value="confirmed">Xác nhận đơn hàng</option>
                      <option value="cancelled">Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <>
                      <option value="preparing">Bắt đầu chuẩn bị hàng</option>
                      <option value="cancelled">Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <>
                      <option value="shipping">Bắt đầu giao hàng</option>
                      <option value="cancelled">Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'shipping' && (
                    <option value="completed">Hoàn thành giao hàng</option>
                  )}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ghi chú</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ghi chú về việc cập nhật trạng thái..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </Form.Group>

              <Alert variant="info">
                <i className="bi bi-info-circle me-2"></i>
                <small>Khách hàng sẽ nhận được thông báo về thay đổi trạng thái này.</small>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdateStatus} disabled={updating || !newStatus}>
            {updating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check me-2"></i>
                Cập nhật
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Handle Cancel Request Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xử lý yêu cầu hủy đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Đơn hàng:</strong> {selectedOrder.orderCode}
                <br />
                <strong>Lý do hủy:</strong> {selectedOrder.cancelReason}
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Hành động <span className="text-danger">*</span></Form.Label>
                <Form.Select value={cancelAction} onChange={(e) => setCancelAction(e.target.value)}>
                  <option value="">-- Chọn hành động --</option>
                  <option value="approve">Chấp thuận hủy đơn</option>
                  <option value="reject">Từ chối yêu cầu</option>
                </Form.Select>
              </Form.Group>

              {cancelAction === 'reject' && (
                <Form.Group className="mb-3">
                  <Form.Label>Lý do từ chối <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Nhập lý do từ chối yêu cầu hủy..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </Form.Group>
              )}

              {cancelAction === 'approve' && (
                <Alert variant="warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <small>Đơn hàng sẽ bị hủy và hàng sẽ được hoàn về kho.</small>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Đóng
          </Button>
          <Button 
            variant={cancelAction === 'approve' ? 'danger' : 'primary'} 
            onClick={handleCancelRequest} 
            disabled={updating || !cancelAction || (cancelAction === 'reject' && !rejectionReason.trim())}
          >
            {updating ? (
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
