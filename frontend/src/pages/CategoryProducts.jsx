// frontend/src/pages/CategoryProducts.jsx - FIXED
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByCategory, clearCategoryProducts } from '../redux/categorySlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import './css/CategoryProducts.css';

export default function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ FIXED: Thêm fallback cho trường hợp state undefined
  const categoryState = useSelector((state) => state.category) || {};
  const { 
    currentCategory = null, 
    categoryProducts = [], 
    pagination = null, 
    loading = false, 
    error = null 
  } = categoryState;
  
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  
  const observer = useRef();
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          console.log('📜 Loading more products...');
          setPage((prevPage) => prevPage + 1);
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Reset khi thay đổi category
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
    dispatch(clearCategoryProducts());
  }, [categoryId, dispatch]);

  // Fetch products khi page thay đổi
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await dispatch(
          fetchProductsByCategory({ categoryId, page, limit: 12 })
        ).unwrap();
        
        setAllProducts((prev) => [...prev, ...result.products]);
        setHasMore(result.pagination.hasNextPage);
      } catch (err) {
        console.error('Error loading products:', err);
      }
    };

    loadProducts();
  }, [categoryId, page]);

  return (
    <div className="category-products-page">
      <Header />

      <Container className="py-4">
        {/* Category Header */}
        {currentCategory && (
          <div className="category-header mb-4">
            <div className="d-flex align-items-center mb-3">
              <button 
                className="btn btn-outline-secondary me-3"
                onClick={() => navigate('/products')}
              >
                <i className="bi bi-arrow-left me-2"></i>
                Tất cả sản phẩm
              </button>
              <div>
                <h1 className="category-title mb-1">
                  <i className="bi bi-grid me-2"></i>
                  {currentCategory.name}
                </h1>
                {currentCategory.description && (
                  <p className="text-muted mb-0">{currentCategory.description}</p>
                )}
              </div>
            </div>
            
            {pagination && (
              <div className="text-muted">
                Hiển thị {allProducts.length} / {pagination.totalProducts} sản phẩm
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="danger" className="mb-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </Alert>
        )}

        {/* Products Grid */}
        {allProducts.length > 0 && (
          <Row className="g-3 mb-4">
            {allProducts.map((product, index) => {
              // Attach ref to last product for infinite scroll
              if (index === allProducts.length - 1) {
                return (
                  <Col key={product._id} xs={6} sm={6} md={4} lg={3} ref={lastProductRef}>
                    <ProductCard product={product} />
                  </Col>
                );
              }
              
              return (
                <Col key={product._id} xs={6} sm={6} md={4} lg={3}>
                  <ProductCard product={product} />
                </Col>
              );
            })}
          </Row>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Đang tải sản phẩm...</p>
          </div>
        )}

        {/* No More Products */}
        {!loading && !hasMore && allProducts.length > 0 && (
          <div className="text-center py-4">
            <p className="text-muted">
              <i className="bi bi-check-circle me-2"></i>
              Đã hiển thị tất cả sản phẩm
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && allProducts.length === 0 && (
          <div className="empty-state text-center py-5">
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="mt-4">Chưa có sản phẩm nào trong danh mục này</h3>
            <button 
              className="btn btn-primary mt-3"
              onClick={() => navigate('/products')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại tất cả sản phẩm
            </button>
          </div>
        )}
      </Container>

      <Footer />
    </div>
  );
}