// frontend/src/components/admin/QuickOrderActions.jsx
// Component để admin nhanh chóng cập nhật trạng thái đơn hàng
import React, { useState } from 'react';
import { Button, ButtonGroup, Spinner, Alert } from 'react-bootstrap';
import orderApi from '../../api/orderApi';
import { useNotification } from '../NotificationProvider';

export function QuickOrderActions({ order, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const notify = useNotification();

  const handleQuickUpdate = async (newStatus, note) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await orderApi.updateOrderStatus(order._id, newStatus, note);
      
      setSuccess(`Đã cập nhật sang ${getStatusText(newStatus)}`);
      notify.success(`Đã cập nhật sang ${getStatusText(newStatus)}`);
      
      // Reload order data
      if (onUpdate) {
        setTimeout(() => onUpdate(), 500);
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi cập nhật');
      notify.error(err.response?.data?.message || 'Lỗi khi cập nhật');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      confirmed: 'Đã xác nhận',
      preparing: 'Đang chuẩn bị',
      shipping: 'Đang giao hàng',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const renderQuickActions = () => {
    switch (order.status) {
      case 'new':
        return (
          <ButtonGroup size="sm">
            <Button
              variant="success"
              onClick={() => handleQuickUpdate('confirmed', 'Admin xác nhận đơn hàng')}
              disabled={updating}
            >
              {updating ? <Spinner animation="border" size="sm" /> : '✓ Xác nhận'}
            </Button>
            <Button
              variant="danger"
              onClick={() => handleQuickUpdate('cancelled', 'Admin hủy đơn hàng')}
              disabled={updating}
            >
              ✗ Hủy
            </Button>
          </ButtonGroup>
        );

      case 'confirmed':
        return (
          <ButtonGroup size="sm">
            <Button
              variant="warning"
              onClick={() => handleQuickUpdate('preparing', 'Bắt đầu chuẩn bị hàng')}
              disabled={updating}
            >
              {updating ? <Spinner animation="border" size="sm" /> : '📦 Chuẩn bị hàng'}
            </Button>
          </ButtonGroup>
        );

      case 'preparing':
        return (
          <ButtonGroup size="sm">
            <Button
              variant="info"
              onClick={() => handleQuickUpdate('shipping', 'Đơn hàng đã giao cho đơn vị vận chuyển')}
              disabled={updating}
            >
              {updating ? <Spinner animation="border" size="sm" /> : '🚚 Bắt đầu giao'}
            </Button>
          </ButtonGroup>
        );

      case 'shipping':
        return (
          <ButtonGroup size="sm">
            <Button
              variant="success"
              onClick={() => handleQuickUpdate('completed', 'Đơn hàng đã được giao thành công')}
              disabled={updating}
            >
              {updating ? <Spinner animation="border" size="sm" /> : '✓ Hoàn thành'}
            </Button>
          </ButtonGroup>
        );

      case 'completed':
      case 'cancelled':
        return (
          <span className="text-muted small">
            Đơn hàng đã kết thúc
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className="quick-order-actions">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-2">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)} className="mb-2">
          {success}
        </Alert>
      )}
      
      {renderQuickActions()}
    </div>
  );
}

// ============================================
// TEST DATA GENERATOR - Tạo đơn hàng test nhanh
// ============================================

export function TestOrderGenerator({ onGenerate }) {
  const [generating, setGenerating] = useState(false);
  const notify = useNotification();

  const generateTestOrder = async () => {
    try {
      setGenerating(true);
      
      // Giả lập tạo đơn hàng test
      // Trong thực tế, bạn cần có API endpoint để tạo đơn test
      console.log('Tạo đơn hàng test...');
      
      // Thông báo
      notify.info('Để tạo đơn hàng test: 1) Đăng nhập user 2) Thêm sản phẩm vào giỏ 3) Đặt hàng 4) Đăng nhập admin 5) Cập nhật đơn hàng "Hoàn thành" 6) Đăng nhập lại user để đánh giá')
      
      if (onGenerate) onGenerate();
    } catch (err) {
      notify.error('Lỗi: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="test-order-generator mb-3">
      <Alert variant="info">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>🧪 Chế độ Test</strong>
            <p className="mb-0 small">
              Tạo đơn hàng test để kiểm tra chức năng đánh giá và điểm tích lũy
            </p>
          </div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={generateTestOrder}
            disabled={generating}
          >
            {generating ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang tạo...
              </>
            ) : (
              'Hướng dẫn tạo đơn test'
            )}
          </Button>
        </div>
      </Alert>
    </div>
  );
}

// ============================================
// BULK UPDATE - Cập nhật nhiều đơn cùng lúc
// ============================================

export function BulkOrderUpdate({ selectedOrders, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const notify = useNotification();

  const handleBulkUpdate = async (targetStatus) => {
    const ok = await notify.confirm({ message: `Cập nhật ${selectedOrders.length} đơn hàng sang trạng thái ${targetStatus}?` });
    if (!ok) return;

    try {
      setUpdating(true);
      setProgress(0);

      for (let i = 0; i < selectedOrders.length; i++) {
        const order = selectedOrders[i];
        await orderApi.updateOrderStatus(
          order._id, 
          targetStatus, 
          `Bulk update by admin - ${new Date().toLocaleString('vi-VN')}`
        );
        
        setProgress(((i + 1) / selectedOrders.length) * 100);
      }

      notify.success(`Đã cập nhật ${selectedOrders.length} đơn hàng thành công!`);
      
      if (onUpdate) onUpdate();
    } catch (err) {
      notify.error('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
      setProgress(0);
    }
  };

  if (selectedOrders.length === 0) {
    return null;
  }

  return (
    <div className="bulk-order-update mb-3">
      <Alert variant="warning">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>Đã chọn {selectedOrders.length} đơn hàng</strong>
          </div>
          <ButtonGroup size="sm">
            <Button
              variant="success"
              onClick={() => handleBulkUpdate('confirmed')}
              disabled={updating}
            >
              Xác nhận tất cả
            </Button>
            <Button
              variant="info"
              onClick={() => handleBulkUpdate('completed')}
              disabled={updating}
            >
              Hoàn thành tất cả
            </Button>
          </ButtonGroup>
        </div>
        
        {updating && (
          <div className="mt-2">
            <div className="progress">
              <div 
                className="progress-bar progress-bar-striped progress-bar-animated" 
                style={{ width: `${progress}%` }}
              >
                {Math.round(progress)}%
              </div>
            </div>
          </div>
        )}
      </Alert>
    </div>
  );
}

export default { QuickOrderActions, TestOrderGenerator, BulkOrderUpdate };
