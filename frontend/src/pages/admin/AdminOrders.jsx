// frontend/src/pages/admin/AdminOrders.jsx - REDESIGNED WITHOUT HEADER/FOOTER
import React, { useEffect, useState } from 'react';
import { Card, Badge, Button, Spinner, Alert, Nav, Modal, Form, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import orderApi from '../../api/orderApi';
import './css/AdminOrders.css';
import { useNotification } from '../../components/NotificationProvider';

export default function AdminOrders() {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const notify = useNotification();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
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
      const response = await orderApi.getAdminOrders();
      const allOrders = response.data.orders;
      
      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setOrders(allOrders);
      setFilteredOrders(allOrders);
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

  const handleUpdateStatus = async () => {
    if (!newStatus) {
      notify.info('Vui lòng chọn trạng thái mới');
      return;
    }

    try {
      setUpdating(true);
      await orderApi.updateOrderStatusAdmin(selectedOrder._id, newStatus, statusNote);
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
      await orderApi.handleCancelRequestAdmin(selectedOrder._id, cancelAction, rejectionReason);
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
      <div className="admin-loading">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-content">
      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon bg-primary">
            <i className="bi bi-receipt"></i>
          </div>
          <div className="stat-info">
            <h3>{orders.length}</h3>
            <p>Tổng đơn hàng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-warning">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="stat-info">
            <h3>{getStatusCount('new')}</h3>
            <p>Đơn hàng mới</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-info">
            <i className="bi bi-truck"></i>
          </div>
          <div className="stat-info">
            <h3>{getStatusCount('shipping')}</h3>
            <p>Đang giao hàng</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-success">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3>{getStatusCount('completed')}</h3>
            <p>Hoàn thành</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* Filter Tabs */}
      <Card className="filter-card mb-4">
        <Nav variant="pills" className="order-filters">
          <Nav.Item>
            <Nav.Link active={activeFilter === 'all'} onClick={() => filterOrders('all')}>
              <i className="bi bi-list-ul me-2"></i>
              Tất cả ({getStatusCount('all')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'new'} onClick={() => filterOrders('new')}>
              <i className="bi bi-clock-history me-2"></i>
              Đơn mới ({getStatusCount('new')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'cancel_requested'} onClick={() => filterOrders('cancel_requested')}>
              <i className="bi bi-exclamation-triangle me-2"></i>
              Yêu cầu hủy ({getStatusCount('cancel_requested')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'confirmed'} onClick={() => filterOrders('confirmed')}>
              <i className="bi bi-check-circle me-2"></i>
              Đã xác nhận ({getStatusCount('confirmed')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'preparing'} onClick={() => filterOrders('preparing')}>
              <i className="bi bi-box-seam me-2"></i>
              Chuẩn bị hàng ({getStatusCount('preparing')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'shipping'} onClick={() => filterOrders('shipping')}>
              <i className="bi bi-truck me-2"></i>
              Đang giao ({getStatusCount('shipping')})
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link active={activeFilter === 'completed'} onClick={() => filterOrders('completed')}>
              <i className="bi bi-check-circle-fill me-2"></i>
              Hoàn thành ({getStatusCount('completed')})
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card className="empty-state">
          <i className="bi bi-inbox" style={{ fontSize: '5rem', color: '#cbd5e1' }}></i>
          <h4 className="mt-3">Không có đơn hàng nào</h4>
          <p className="text-muted">Chưa có đơn hàng nào trong trạng thái này</p>
        </Card>
      ) : (
        <Card className="orders-table-card">
          <Table responsive hover className="orders-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong className="order-code">{order.orderCode}</strong>
                  </td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.addressId?.fullName || 'N/A'}</strong>
                      <small>{order.addressId?.phone}</small>
                    </div>
                  </td>
                  <td>
                    <small className="text-muted">
                      {new Date(order.createdAt).toLocaleString('vi-VN')}
                    </small>
                  </td>
                  <td>
                    <strong className="order-price">
                      {order.totalPrice.toLocaleString('vi-VN')}đ
                    </strong>
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/orders/${order._id}`)}
                        title="Xem chi tiết"
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                      
                      {order.status === 'cancel_requested' ? (
                        <Button
                          variant="outline-warning"
                          size="sm"
                          onClick={() => openCancelModal(order)}
                          title="Xử lý yêu cầu hủy"
                        >
                          <i className="bi bi-exclamation-triangle"></i>
                        </Button>
                      ) : (
                        order.status !== 'cancelled' && order.status !== 'completed' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => openStatusModal(order)}
                            title="Cập nhật trạng thái"
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
        </Card>
      )}

      {/* Update Status Modal */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Cập nhật trạng thái đơn hàng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="order-info-box mb-3">
                <div className="info-row">
                  <span className="label">Đơn hàng:</span>
                  <strong>{selectedOrder.orderCode}</strong>
                </div>
                <div className="info-row">
                  <span className="label">Trạng thái hiện tại:</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Trạng thái mới <span className="text-danger">*</span></Form.Label>
                <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="">-- Chọn trạng thái --</option>
                  {selectedOrder.status === 'new' && (
                    <>
                      <option value="confirmed">✓ Xác nhận đơn hàng</option>
                      <option value="cancelled">✗ Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <>
                      <option value="preparing">📦 Bắt đầu chuẩn bị hàng</option>
                      <option value="cancelled">✗ Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'preparing' && (
                    <>
                      <option value="shipping">🚚 Bắt đầu giao hàng</option>
                      <option value="cancelled">✗ Hủy đơn hàng</option>
                    </>
                  )}
                  {selectedOrder.status === 'shipping' && (
                    <option value="completed">✓ Hoàn thành giao hàng</option>
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

              <Alert variant="info" className="mb-0">
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
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Xử lý yêu cầu hủy đơn
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="order-info-box mb-3">
                <div className="info-row">
                  <span className="label">Đơn hàng:</span>
                  <strong>{selectedOrder.orderCode}</strong>
                </div>
                <div className="info-row">
                  <span className="label">Lý do hủy:</span>
                  <span>{selectedOrder.cancelReason}</span>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>Hành động <span className="text-danger">*</span></Form.Label>
                <Form.Select value={cancelAction} onChange={(e) => setCancelAction(e.target.value)}>
                  <option value="">-- Chọn hành động --</option>
                  <option value="approve">✓ Chấp thuận hủy đơn</option>
                  <option value="reject">✗ Từ chối yêu cầu</option>
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
                <Alert variant="warning" className="mb-0">
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
    </div>
  );
}
