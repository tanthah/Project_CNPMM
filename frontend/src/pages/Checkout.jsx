// frontend/src/pages/Checkout.jsx - HANDLE BUY NOW & SELECTED ITEMS
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';
import orderApi from '../api/orderApi';
import addressApi from '../api/addressApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Checkout.css';
import { useNotification } from '../components/NotificationProvider';
import AddAddressModal from '../components/AddAddressModal';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { cart, loading: cartLoading } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const notify = useNotification();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const shippingFee = 30000;

  // ✅ Xác định items cần thanh toán: Buy Now hoặc Selected Items
  const [checkoutItems, setCheckoutItems] = useState([]);
  const updateItemQuantity = (index, newQty) => {
    setCheckoutItems(prev => {
      const items = [...prev];
      const max = items[index].stock || 9999;
      const qty = Math.max(1, Math.min(newQty, max));
      items[index] = { ...items[index], quantity: qty };
      return items;
    });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // ✅ Xử lý Buy Now
    if (location.state?.buyNow && location.state?.product) {
      setCheckoutItems([location.state.product]);
    } 
    // ✅ Xử lý Selected Items từ Cart
    else if (location.state?.selectedItems) {
      setCheckoutItems(location.state.selectedItems);
    } 
    // ✅ Fallback: Lấy toàn bộ giỏ hàng
    else {
      dispatch(fetchCart());
    }

    loadAddresses();
  }, [dispatch, token, navigate, location.state]);

  // ✅ Nếu không có items từ state, dùng cart
  useEffect(() => {
    if (!location.state?.buyNow && !location.state?.selectedItems && cart?.items) {
      setCheckoutItems(cart.items);
    }
  }, [cart, location.state]);

  const loadAddresses = async () => {
    try {
      const response = await addressApi.getAddresses();
      const addressList = response.data.addresses;
      setAddresses(addressList);
      
      const defaultAddr = addressList.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr._id);
      } else if (addressList.length > 0) {
        setSelectedAddress(addressList[0]._id);
      }
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };


  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (checkoutItems.length === 0) {
      setError('Không có sản phẩm nào để thanh toán');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const itemsPayload = checkoutItems.map((it) => ({
        productId: it.productId?._id || it.productId,
        quantity: it.quantity
      }));
      const response = await orderApi.createOrder({
        addressId: selectedAddress,
        notes,
        shippingFee,
        items: itemsPayload
      });

      if (response.data.success) {
        notify.success('Đặt hàng thành công!');
        navigate(`/orders/${response.data.order._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (cartLoading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải...</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#ccc' }}></i>
          <h3 className="mt-3">Không có sản phẩm nào để thanh toán</h3>
          <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
            Tiếp tục mua sắm
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  const selectedAddressData = addresses.find(addr => addr._id === selectedAddress);

  // ✅ Tính tổng tiền từ checkoutItems
  const totalPrice = checkoutItems.reduce((sum, item) => {
    return sum + (item.finalPrice * item.quantity);
  }, 0);

  const totalQuantity = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <Header />
      <Container className="py-4 checkout-page">
        <h2 className="mb-4">
          <i className="bi bi-credit-card me-2"></i>
          Thanh toán đơn hàng
        </h2>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <Row>
          <Col lg={8}>
            {/* Địa chỉ giao hàng */}
            <Card className="mb-3">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  Địa chỉ giao hàng
                </h5>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => setShowAddressModal(true)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Thêm địa chỉ mới
                </Button>
              </Card.Header>
              <Card.Body>
                {addresses.length === 0 ? (
                  <p className="text-muted text-center">
                    Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ mới.
                  </p>
                ) : (
                  <>
                    {addresses.map((addr) => (
                      <div 
                        key={addr._id}
                        className={`address-item p-3 mb-2 border rounded ${selectedAddress === addr._id ? 'border-primary bg-light' : ''}`}
                        onClick={() => setSelectedAddress(addr._id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Form.Check
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr._id}
                          onChange={() => setSelectedAddress(addr._id)}
                          label={
                            <div>
                              <strong>{addr.fullName}</strong> | {addr.phone}
                              {addr.isDefault && (
                                <span className="badge bg-success ms-2">Mặc định</span>
                              )}
                              <div className="text-muted mt-1">
                                {addr.addressLine}, {addr.ward}, {addr.district}, {addr.city}
                              </div>
                            </div>
                          }
                        />
                      </div>
                    ))}
                  </>
                )}
              </Card.Body>
            </Card>

            {/* Sản phẩm */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-box-seam me-2"></i>
                  Sản phẩm ({totalQuantity})
                </h5>
              </Card.Header>
              <Card.Body>
                {checkoutItems.map((item, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                    <img 
                      src={item.productImage || item.productId?.images?.[0] || 'https://via.placeholder.com/80'} 
                      alt={item.productName || item.productId?.name}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">{item.productName || item.productId?.name}</h6>
                      <div className="text-danger fw-bold">
                        {item.finalPrice.toLocaleString('vi-VN')}đ x {item.quantity}
                      </div>
                      <div className="mt-2 d-flex align-items-center gap-2">
                        <Button variant="outline-secondary" size="sm" onClick={() => updateItemQuantity(index, item.quantity - 1)}>-</Button>
                        <span className="px-2">{item.quantity}</span>
                        <Button variant="outline-secondary" size="sm" onClick={() => updateItemQuantity(index, item.quantity + 1)}>+</Button>
                        {item.stock ? (
                          <small className="text-muted ms-2">Còn {item.stock}</small>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-end">
                      <strong className="text-primary">
                        {(item.finalPrice * item.quantity).toLocaleString('vi-VN')}đ
                      </strong>
                    </div>
                  </div>
                ))}
              </Card.Body>
            </Card>

            {/* Ghi chú */}
            <Card className="mb-3">
              <Card.Header className="bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-chat-left-text me-2"></i>
                  Ghi chú đơn hàng
                </h5>
              </Card.Header>
              <Card.Body>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Ghi chú cho người bán..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="sticky-top checkout-summary" style={{ top: '100px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Tóm tắt đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong>{shippingFee.toLocaleString('vi-VN')}đ</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {(totalPrice + shippingFee).toLocaleString('vi-VN')}đ
                  </h5>
                </div>

                {selectedAddressData && (
                  <div className="mb-3 p-2 bg-light rounded">
                    <small className="text-muted">Giao đến:</small>
                    <div className="mt-1">
                      <strong>{selectedAddressData.fullName}</strong>
                      <div className="text-muted small">
                        {selectedAddressData.phone}
                      </div>
                    </div>
                  </div>
                )}

                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  <small>Thanh toán khi nhận hàng (COD)</small>
                </div>

                <Button
                  variant="danger"
                  size="lg"
                  className="w-100"
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Đặt hàng
                    </>
                  )}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <AddAddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onAdded={() => { loadAddresses(); setShowAddressModal(false) }}
      />

      <Footer />
    </>
  );
}
