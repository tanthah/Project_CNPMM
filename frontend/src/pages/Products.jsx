// frontend/src/pages/Products.jsx - FIXED VERSION
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, Card, Badge, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../redux/categorySlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import PriceRangeSlider from '../components/PriceRangeSlider';
import productApi from '../api/productApi';
import './css/Products.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { categories } = useSelector((s) => s.category);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100000000);
  
  const limit = 16;

  // Intersection Observer for infinite scroll
  const observer = useRef();
  const lastProductRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        console.log('📜 Loading more products...');
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Load categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Get filters from URL on mount
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const sort = searchParams.get('sort') || 'newest';
    const min = searchParams.get('minPrice') || '0';
    const max = searchParams.get('maxPrice') || '100000000';
    
    setSearchQuery(search);
    setSelectedCategory(category);
    setSortBy(sort);
    setMinPrice(parseInt(min));
    setMaxPrice(parseInt(max));
  }, []); // Only run once on mount

  // Reset pagination when filters change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [sortBy, selectedCategory, searchQuery, minPrice, maxPrice]);

  // Fetch products when page or filters change
  useEffect(() => {
    fetchProducts();
  }, [page, sortBy, selectedCategory, searchQuery, minPrice, maxPrice]);

  const fetchProducts = async () => {
    // Prevent duplicate calls
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = {
        page,
        limit,
        sortBy
      };

      // Add category filter if not 'all'
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      // Add search query if exists
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Add price range if not default
      if (minPrice > 0) {
        params.minPrice = minPrice;
      }
      if (maxPrice < 100000000) {
        params.maxPrice = maxPrice;
      }

      console.log('🔍 Fetching products with params:', params);
      
      const response = await productApi.getPaginated(params.page, params.limit, params.sortBy, params);
      const newProducts = response.data.products || [];
      const pagination = response.data.pagination;

      // Append or replace products based on page
      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      setHasMore(pagination.hasNextPage);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Không thể tải danh sách sản phẩm');
      setLoading(false);
      setHasMore(false);
    }
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    updateURL({ sort: newSort });
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    updateURL({ category: categoryId });
  };

  const handlePriceRangeChange = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    updateURL({ minPrice: min, maxPrice: max });
  };

  const updateURL = (params) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (value === 'all' || value === 'newest' || !value || 
          (key === 'minPrice' && value === 0) || 
          (key === 'maxPrice' && value === 100000000)) {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setMinPrice(0);
    setMaxPrice(100000000);
    setSortBy('newest');
    setSearchParams({});
  };

  // Helper function to check if category is active
  const isCategoryActive = (categoryId) => {
    if (categoryId === 'all') {
      return selectedCategory === 'all';
    }
    // Compare as strings to handle both string and ObjectId
    return selectedCategory === categoryId || selectedCategory === categoryId.toString();
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== 'all' ? selectedCategory : null,
    minPrice > 0 || maxPrice < 100000000 ? 'price' : null,
  ].filter(Boolean).length;

  return (
    <div className="products-page">
      <Header />

      <Container className="py-4">

        <Row>
          {/* Sidebar Filters */}
          <Col lg={3} className="mb-4">
            <Card className="filter-card sticky-top" style={{ top: '120px' }}>
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-funnel me-2"></i>
                  Bộ lọc
                </h5>
                {activeFiltersCount > 0 && (
                  <Badge bg="danger">{activeFiltersCount}</Badge>
                )}
              </Card.Header>
              <Card.Body>
                {/* Categories */}
                <div className="filter-section mb-4">
                  <h6 className="filter-title">
                    <i className="bi bi-grid me-2"></i>
                    Danh mục
                  </h6>
                  <div className="category-list scrollable-list">
                    <div 
                      className={`category-item ${isCategoryActive('all') ? 'active' : ''}`}
                      onClick={() => handleCategoryChange('all')}
                    >
                      <i className="bi bi-list-ul me-2"></i>
                      Tất cả
                    </div>
                    {categories && categories.map(cat => (
                      <div
                        key={cat._id}
                        className={`category-item ${isCategoryActive(cat._id) ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(cat._id)}
                      >
                        <i className="bi bi-tag me-2"></i>
                        {cat.name}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range Slider */}
                <div className="filter-section mb-4">
                  <h6 className="filter-title">
                    <i className="bi bi-cash me-2"></i>
                    Khoảng giá
                  </h6>
                  <PriceRangeSlider
                    min={0}
                    max={100000000}
                    currentMin={minPrice}
                    currentMax={maxPrice}
                    onApply={(min, max) => handlePriceRangeChange(min, max)}
                  />
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="w-100"
                    onClick={clearFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Xóa bộ lọc
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Products Grid */}
          <Col lg={9}>
            {/* Filters and Sort Bar */}
            <div className="filters-section mb-4">
              <Row className="align-items-center">
                <Col md={6}>
                  <div className="d-flex align-items-center">
                    <span className="text-muted me-3">
                      <i className="bi bi-check-circle text-success me-1"></i>
                      Hiển thị <strong>{products.length}</strong> sản phẩm
                    </span>
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Select 
                    value={sortBy} 
                    onChange={handleSortChange}
                    className="sort-select"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="best-selling">Bán chạy nhất</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="discount">Giảm giá nhiều nhất</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="name-desc">Tên Z-A</option>
                  </Form.Select>
                </Col>
              </Row>
            </div>

            {/* Error State */}
            {error && (
              <Alert variant="danger" className="mb-4">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </Alert>
            )}

            {/* Products Grid */}
            {!loading && products.length > 0 && (
              <Row className="g-3 mb-4">
                {products.map((product, index) => {
                  // Attach ref to last product for infinite scroll
                  if (index === products.length - 1) {
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
            {!loading && !hasMore && products.length > 0 && (
              <div className="text-center py-4">
                <p className="text-muted">
                  <i className="bi bi-check-circle me-2"></i>
                  Đã hiển thị tất cả sản phẩm
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="empty-state text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h3 className="mt-4">Không tìm thấy sản phẩm</h3>
                <p className="text-muted">
                  {searchQuery 
                    ? `Không có sản phẩm nào phù hợp với "${searchQuery}"`
                    : 'Vui lòng thử lại với bộ lọc khác'}
                </p>
                {activeFiltersCount > 0 && (
                  <Button variant="primary" className="mt-3" onClick={clearFilters}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
}