// frontend/src/pages/Checkout.jsx - HANDLE BUY NOW & SELECTED ITEMS WITH COUPON
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../redux/cartSlice';
import orderApi from '../api/orderApi';
import addressApi from '../api/addressApi';
import couponApi from '../api/couponApi';
import loyaltyApi from '../api/loyaltyApi';
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

  // ✅ State cho mã giảm giá
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // ✅ State cho điểm thưởng
  const [loyaltyPoints, setLoyaltyPoints] = useState(0); // Điểm khả dụng
  const [usedPoints, setUsedPoints] = useState(0); // Điểm muốn dùng
  const [pointsError, setPointsError] = useState('');

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
    loadLoyaltyPoints();
  }, [dispatch, token, navigate, location.state]);

  const loadLoyaltyPoints = async () => {
    try {
      const response = await loyaltyApi.getLoyaltyPoints();
      if (response.data.success) {
        setLoyaltyPoints(response.data.loyaltyPoints?.availablePoints || 0);
      }
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    }
  };

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

  // ✅ Áp dụng mã giảm giá
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await couponApi.validateCoupon(couponCode, totalPrice);
      if (response.data.success) {
        setCouponData(response.data.coupon);
        notify.success('Áp dụng mã giảm giá thành công!');
      }
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  // ✅ Xóa mã giảm giá
  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
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
        items: itemsPayload,
        couponCode: couponData?.code || null,
        usedPoints: usedPoints > 0 ? usedPoints : null
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

  // ✅ Tính giảm giá và tổng cộng
  const discountAmount = couponData?.discount || 0;

  // 1 điểm = 200 VNĐ
  const pointsValue = usedPoints * 200;

  const finalTotal = totalPrice + shippingFee - discountAmount - pointsValue;

  // Handler for points input
  const handlePointsChange = (e) => {
    const val = parseInt(e.target.value) || 0;

    if (val < 0) return;

    if (val > loyaltyPoints) {
      setPointsError(`Bạn chỉ có ${loyaltyPoints} điểm`);
      setUsedPoints(loyaltyPoints);
      return;
    }

    // Check if discount > total order value (before points)
    const maxDiscount = totalPrice + shippingFee - discountAmount;
    const maxPoints = Math.floor(maxDiscount / 200);

    if (val > maxPoints) {
      // Cho phép nhập nhưng cảnh báo hoặc auto correct?
      // Ở đây auto correct để an toàn
      setPointsError(`Tối đa có thể dùng ${maxPoints} điểm cho đơn này`);
      setUsedPoints(maxPoints);
      return;
    }

    setUsedPoints(val);
    setPointsError('');
  };

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
                {/* ✅ Mã giảm giá */}
                <div className="coupon-section mb-3">
                  <label className="form-label fw-bold">
                    <i className="bi bi-tag me-2"></i>
                    Mã giảm giá
                  </label>
                  <InputGroup>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã giảm giá..."
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={couponData !== null}
                      className="coupon-input"
                    />
                    {couponData ? (
                      <Button variant="outline-danger" onClick={handleRemoveCoupon}>
                        <i className="bi bi-x-lg"></i>
                      </Button>
                    ) : (
                      <Button
                        variant="outline-primary"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                      >
                        {couponLoading ? <Spinner animation="border" size="sm" /> : 'Áp dụng'}
                      </Button>
                    )}
                  </InputGroup>
                  {couponError && <small className="text-danger mt-1 d-block">{couponError}</small>}
                  {couponData && (
                    <div className="alert alert-success mt-2 py-2 mb-0">
                      <i className="bi bi-check-circle me-2"></i>
                      Giảm <strong>{couponData.discount.toLocaleString('vi-VN')}đ</strong>
                    </div>
                  )}
                </div>

                {/* ✅ Điểm thưởng - Simple Loyalty */}
                <div className="loyalty-section mb-3 border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label fw-bold mb-0">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      Dùng điểm thưởng
                    </label>
                    <small className="text-muted">
                      Có sẵn: <strong>{loyaltyPoints}</strong> điểm
                    </small>
                  </div>

                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Nhập số điểm..."
                      value={usedPoints || ''}
                      onChange={handlePointsChange}
                      min="0"
                      max={loyaltyPoints}
                      disabled={loyaltyPoints === 0}
                    />
                    <span className="input-group-text bg-white text-success">
                      -{(usedPoints * 200).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="form-text small text-muted">
                    5 điểm = 1.000đ. Tối đa dùng {loyaltyPoints} điểm.
                  </div>
                  {pointsError && <small className="text-danger">{pointsError}</small>}
                </div>

                <hr />

                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong>{shippingFee.toLocaleString('vi-VN')}đ</strong>
                </div>
                {discountAmount > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Coupon:</span>
                    <strong>-{discountAmount.toLocaleString('vi-VN')}đ</strong>
                  </div>
                )}
                {usedPoints > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Điểm thưởng ({usedPoints}):</span>
                    <strong>-{(usedPoints * 200).toLocaleString('vi-VN')}đ</strong>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {finalTotal.toLocaleString('vi-VN')}đ
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
