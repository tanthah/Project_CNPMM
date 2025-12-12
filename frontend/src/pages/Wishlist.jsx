// frontend/src/pages/Wishlist.jsx
import React, { useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWishlist, removeFromWishlist, clearWishlist } from '../redux/wishlistSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useNotification } from '../components/NotificationProvider';

export default function Wishlist() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((s) => s.auth);
  const { wishlist, loading, error } = useSelector((s) => s.wishlist);
  const notify = useNotification();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    dispatch(fetchWishlist());
  }, [dispatch, token, navigate]);

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromWishlist(productId)).unwrap();
    } catch (err) {
      notify.error(err);
    }
  };

  if (loading) {
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

  return (
    <>
      <Header />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">
            <i className="bi bi-heart me-2"></i>
            Sản phẩm yêu thích ({wishlist?.products?.length || 0})
          </h2>
          {wishlist?.products?.length > 0 && (
            <Button variant="outline-danger" size="sm" onClick={() => dispatch(clearWishlist())}>
              <i className="bi bi-trash me-1"></i>
              Xóa toàn bộ yêu thích
            </Button>
          )}
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {!wishlist || wishlist.products.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-heart" style={{ fontSize: '5rem', color: '#ccc' }}></i>
            <h4 className="mt-3">Chưa có sản phẩm yêu thích</h4>
            <Button variant="primary" onClick={() => navigate('/products')} className="mt-3">
              Khám phá sản phẩm
            </Button>
          </div>
        ) : (
          <Row className="g-3 wishlist-strong-border">
            {wishlist.products.map((item) => (
              <Col key={item._id} xs={6} sm={6} md={4} lg={3}>
                <div className="d-flex flex-column h-100">
                  <ProductCard product={item.productId} />
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => handleRemove(item.productId._id)}
                  >
                    <i className="bi bi-heart-fill me-1"></i>
                    Bỏ yêu thích
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      <Footer />
    </>
  );
}
