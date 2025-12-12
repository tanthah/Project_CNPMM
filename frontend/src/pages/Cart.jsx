// frontend/src/pages/Cart.jsx - WITH CHECKBOX SELECTION
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Image, Alert, Spinner, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../redux/cartSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './css/Cart.css';
import { useNotification } from '../components/NotificationProvider';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart, loading, updating, error } = useSelector((state) => state.cart);
  const { token } = useSelector((state) => state.auth);
  const notify = useNotification();

  // ✅ State để lưu các sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
  }, [dispatch, token, navigate]);

  // ✅ Chọn/Bỏ chọn tất cả
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allProductIds = cart.items.map(item => item.productId?._id || item.productId);
      setSelectedItems(allProductIds);
    } else {
      setSelectedItems([]);
    }
  };

  // ✅ Chọn/Bỏ chọn từng sản phẩm
  const handleSelectItem = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await dispatch(updateCartItem({ 
        productId: productId, 
        quantity: newQuantity 
      })).unwrap();
    } catch (err) {
      notify.error(err || 'Lỗi khi cập nhật giỏ hàng');
    }
  };

  const handleRemoveItem = async (productId) => {
    const ok = await notify.confirm({ message: 'Bạn có chắc muốn xóa sản phẩm này?' });
    if (ok) {
      try {
        await dispatch(removeFromCart(productId)).unwrap();
        // Xóa khỏi selectedItems nếu có
        setSelectedItems(prev => prev.filter(id => id !== productId));
      } catch (err) {
        notify.error(err || 'Lỗi khi xóa sản phẩm');
      }
    }
  };

  const handleClearCart = async () => {
    const ok = await notify.confirm({ message: 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?' });
    if (ok) {
      try {
        await dispatch(clearCart()).unwrap();
        setSelectedItems([]);
      } catch (err) {
        notify.error(err || 'Lỗi khi xóa giỏ hàng');
      }
    }
  };

  // ✅ Thanh toán chỉ các sản phẩm được chọn
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      notify.info('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }

    const selectedProducts = cart.items.filter(item => {
      const productId = item.productId?._id || item.productId;
      return selectedItems.includes(productId);
    });

    navigate('/checkout', {
      state: {
        selectedItems: selectedProducts
      }
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <Spinner animation="border" />
          <p className="mt-3">Đang tải giỏ hàng...</p>
        </Container>
        <Footer />
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header />
        <Container className="py-5 text-center">
          <i className="bi bi-cart-x" style={{ fontSize: '5rem', color: '#ccc' }}></i>
          <h3 className="mt-3">Giỏ hàng trống</h3>
          <p className="text-muted">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
          <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
            <i className="bi bi-arrow-left me-2"></i>
            Tiếp tục mua sắm
          </Button>
        </Container>
        <Footer />
      </>
    );
  }

  // ✅ Tính tổng tiền chỉ cho các sản phẩm được chọn
  const selectedTotal = cart.items
    .filter(item => selectedItems.includes(item.productId?._id || item.productId))
    .reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

  const selectedQuantity = cart.items
    .filter(item => selectedItems.includes(item.productId?._id || item.productId))
    .reduce((sum, item) => sum + item.quantity, 0);

  const isAllSelected = cart.items.length > 0 && selectedItems.length === cart.items.length;

  return (
    <>
      <Header />
      <Container className="py-4 cart-page">
        {error && (
          <Alert variant="danger" dismissible>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-cart3 me-2"></i>
            Giỏ hàng của bạn
          </h2>
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={handleClearCart} 
            disabled={updating}
          >
            <i className="bi bi-trash me-1"></i>
            Xóa tất cả
          </Button>
        </div>

        <Row>
          <Col lg={8}>
            {/* ✅ Checkbox chọn tất cả */}
            <Card className="mb-3 p-3">
              <Form.Check
                type="checkbox"
                label={<strong>Chọn tất cả ({cart.items.length} sản phẩm)</strong>}
                checked={isAllSelected}
                onChange={handleSelectAll}
              />
            </Card>

            {cart.items.map((item) => {
              const productId = item.productId?._id || item.productId;
              const isSelected = selectedItems.includes(productId);
              
              return (
                <Card key={item._id} className={`mb-3 cart-item-card ${isSelected ? 'border-primary' : ''}`}>
                  <Card.Body>
                    <Row className="align-items-center">
                      {/* ✅ Checkbox chọn sản phẩm */}
                      <Col xs={1} className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(productId)}
                        />
                      </Col>

                      <Col xs={2} md={2}>
                        <Image
                          src={item.productImage || 'https://via.placeholder.com/100'}
                          rounded
                          style={{ width: '100%', maxWidth: '100px', cursor: 'pointer' }}
                          onClick={() => navigate(`/product/${productId}`)}
                        />
                      </Col>

                      <Col xs={9} md={3}>
                        <h6 
                          className="mb-1 product-name"
                          onClick={() => navigate(`/product/${productId}`)}
                          style={{ cursor: 'pointer' }}
                        >
                          {item.productName}
                        </h6>
                        <div className="text-danger fw-bold">
                          {item.finalPrice.toLocaleString('vi-VN')}đ
                        </div>
                        {item.price > item.finalPrice && (
                          <small className="text-muted text-decoration-line-through">
                            {item.price.toLocaleString('vi-VN')}đ
                          </small>
                        )}
                      </Col>

                      <Col xs={6} md={3} className="mt-2 mt-md-0">
                        <div className="quantity-controls d-flex align-items-center gap-2">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, item.quantity - 1)}
                            disabled={updating || item.quantity <= 1}
                          >
                            <i className="bi bi-dash"></i>
                          </Button>
                          <span className="fw-bold px-2">{item.quantity}</span>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => handleUpdateQuantity(productId, item.quantity + 1)}
                            disabled={updating}
                          >
                            <i className="bi bi-plus"></i>
                          </Button>
                        </div>
                      </Col>

                      <Col xs={4} md={2} className="text-end mt-2 mt-md-0">
                        <div className="fw-bold text-primary">
                          {(item.finalPrice * item.quantity).toLocaleString('vi-VN')}đ
                        </div>
                      </Col>

                      <Col xs={2} md={1} className="text-end mt-2 mt-md-0">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveItem(productId)}
                          disabled={updating}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </Col>

          <Col lg={4}>
            <Card className="sticky-top cart-summary" style={{ top: '100px' }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Thông tin đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Sản phẩm đã chọn:</span>
                  <strong>{selectedQuantity}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tạm tính:</span>
                  <strong>{selectedTotal.toLocaleString('vi-VN')}đ</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển:</span>
                  <strong className="text-success">
                    {selectedItems.length > 0 ? '30,000đ' : '0đ'}
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <h5>Tổng cộng:</h5>
                  <h5 className="text-danger">
                    {selectedItems.length > 0 
                      ? (selectedTotal + 30000).toLocaleString('vi-VN')
                      : '0'}đ
                  </h5>
                </div>
                <Button
                  variant="danger"
                  size="lg"
                  className="w-100 mb-2"
                  onClick={handleCheckout}
                  disabled={updating || selectedItems.length === 0}
                >
                  <i className="bi bi-credit-card me-2"></i>
                  Thanh toán ({selectedItems.length})
                </Button>
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => navigate('/products')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
}
