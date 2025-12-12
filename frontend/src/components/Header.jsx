// frontend/src/components/Header.jsx - UPDATED
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  Button,
  Badge,
  Image,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import productApi from '../api/productApi'
import categoryApi from '../api/categoryApi'
import { useSelector, useDispatch } from "react-redux";

import { logout } from "../redux/authSlice";
import { fetchCart } from "../redux/cartSlice";

import "./css/Header.css";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, token } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [brandSuggestions, setBrandSuggestions] = useState([]);

  const isAdmin = user?.role === "admin";
  const cartItemCount = cart?.totalQuantity || 0;

  /* ---------------------- FETCH INITIAL DATA ---------------------- */
  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [token, dispatch]);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.data.categories || []))
      .catch(() => setCategories([]));
  }, []);

  /* ---------------------- HANDLERS ---------------------- */
  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate("/");
  }, [dispatch, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSuggest(false);
    }
  };

  const handleCartClick = () => {
    navigate(token ? "/cart" : "/login");
  };

  const getAvatarUrl = () =>
    user?.avatar?.includes("cloudinary.com")
      ? user.avatar
      : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.name || "User") + "&background=667eea&color=fff&size=50";

  const handleImageError = (e) => {
    e.target.src = "https://ui-avatars.com/api/?name=User&background=667eea&color=fff&size=50";
  };

  return (
    <header className="header-main">
      {/* ---------------------- TOP BAR ---------------------- */}
      <div className="top-bar">
        <Container>
          <div className="d-flex justify-content-between">
            <div>
              <i className="bi bi-telephone-fill me-2"></i>
              Hotline: 1900 xxxx
              <span className="mx-3">|</span>
              <i className="bi bi-envelope-fill me-2"></i>
              support@tvshop.com
            </div>
            <div>
              <i className="bi bi-truck me-2"></i>
              Miễn phí vận chuyển cho đơn hàng từ 500K
            </div>
          </div>
        </Container>
      </div>

      {/* ---------------------- NAVBAR ---------------------- */}
      <Navbar bg="white" expand="lg" className="shadow-sm main-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <i className="bi bi-shop text-primary me-1"></i>
            <span className="brand-text">TV Shop</span>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
            {/* ---------------------- NAVIGATION LINKS ---------------------- */}
            <Nav className="me-auto category-nav-inline">
              <Nav.Link as={Link} to="/" className="category-link">
                <i className="bi bi-house-door me-1"></i>Trang chủ
              </Nav.Link>

              <Nav.Link as={Link} to="/products" className="category-link">
                <i className="bi bi-box-seam me-1"></i>Sản phẩm
              </Nav.Link>

              <Nav.Link as={Link} to="/about" className="category-link">
                <i className="bi bi-info-circle me-1"></i>Giới thiệu
              </Nav.Link>
            </Nav>

            {/* ---------------------- SEARCH BAR ---------------------- */}
            <Form className="search-form position-relative" onSubmit={handleSearch}>
              <div className="input-group">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (val.trim().length === 0) {
                      setSuggestions([]);
                      setCategorySuggestions([]);
                      setBrandSuggestions([]);
                      setShowSuggest(false);
                      return;
                    }
                    setSuggestLoading(true);
                    setShowSuggest(true);
                    const controller = new AbortController();
                    const q = val;
                    Promise.resolve().then(async () => {
                      try {
                        const res = await productApi.suggest(q, 8);
                        setSuggestions(res.data.suggestions || []);
                        const nq = q.toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '');
                        const catSugs = (categories || []).filter(c => 
                          (c?.name || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}+/gu, '').includes(nq)
                        ).slice(0, 8);
                        setCategorySuggestions(catSugs);
                        const fuzzy = await productApi.searchFuzzy(q, 1, 12);
                        const brands = Array.from(new Set((fuzzy.data.products || [])
                          .map(p => p.brand)
                          .filter(Boolean)));
                        setBrandSuggestions(brands.slice(0, 8));
                      } catch (err) {
                        setSuggestions([]);
                        setCategorySuggestions([]);
                        setBrandSuggestions([]);
                      } finally {
                        setSuggestLoading(false);
                      }
                    });
                  }}
                  className="search-input"
                  />
                <Button type="submit" className="search-btn">
                  <i className="bi bi-search"></i>
                </Button>
              </div>
              {showSuggest && (
                <div className="bg-white border rounded shadow-sm position-absolute w-100" style={{ top: '100%', zIndex: 1000 }}>
                  {suggestLoading && (
                    <div className="p-2 text-muted small">Đang gợi ý...</div>
                  )}
                  {!suggestLoading && (
                    <>
                      {categorySuggestions.length > 0 && (
                        <div className="p-2 border-bottom">
                          <div className="text-muted small mb-1">Danh mục</div>
                          {categorySuggestions.map(cat => (
                            <button
                              key={cat._id}
                              type="button"
                              className="btn btn-link text-start w-100 p-1"
                              onClick={() => {
                                navigate(`/category/${cat._id}`);
                                setSearchQuery("");
                                setShowSuggest(false);
                              }}
                            >
                              {cat.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {brandSuggestions.length > 0 && (
                        <div className="p-2 border-bottom">
                          <div className="text-muted small mb-1">Thương hiệu</div>
                          {brandSuggestions.map(b => (
                            <button
                              key={b}
                              type="button"
                              className="btn btn-link text-start w-100 p-1"
                              onClick={() => {
                                navigate(`/search?query=${encodeURIComponent(b)}`);
                                setSearchQuery("");
                                setShowSuggest(false);
                              }}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      )}
                      {suggestions.length === 0 && categorySuggestions.length === 0 && brandSuggestions.length === 0 && (
                        <div className="p-2 text-muted small">Không có gợi ý</div>
                      )}
                      {suggestions.length > 0 && (
                        <div className="p-2">
                          <div className="text-muted small mb-1">Sản phẩm</div>
                          {suggestions.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              className="btn btn-link text-start w-100 p-2"
                              onClick={() => {
                                navigate(`/search?query=${encodeURIComponent(s.name)}`);
                                setSearchQuery("");
                                setShowSuggest(false);
                              }}
                            >
                              <div className="d-flex align-items-center">
                                {s.image && (
                                  <img src={s.image} alt={s.name} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 6, marginRight: 8 }} />
                                )}
                                <div className="flex-grow-1">
                                  <div className="fw-semibold" style={{ fontSize: '0.9rem' }}>{s.name}</div>
                                  {s.brand && <div className="text-muted" style={{ fontSize: '0.8rem' }}>{s.brand}</div>}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </Form>

            {/* ---------------------- RIGHT MENU ---------------------- */}
            <Nav className="ms-auto align-items-center">
              <Nav.Link
                onClick={handleCartClick}
                className="position-relative me-3 cart-link"
              >
                <i className="bi bi-cart3 fs-5"></i>
                {cartItemCount > 0 && (
                  <Badge bg="danger" pill className="cart-badge">
                    {cartItemCount}
                  </Badge>
                )}
              </Nav.Link>

              {token ? (
                <NavDropdown
                  title={
                    <div className="d-flex align-items-center">
                      <Image
                        src={getAvatarUrl()}
                        roundedCircle
                        onError={handleImageError}
                        className="user-avatar"
                      />
                      <span className="user-name d-none d-lg-inline">
                        {user?.name || "User"}
                      </span>
                    </div>
                  }
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/review-profile">
                    <i className="bi bi-person me-2"></i>Hồ sơ
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/orders">
                    <i className="bi bi-box-seam me-2"></i>Đơn hàng
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/reviews">
                    <i className="bi bi-star me-2"></i>Đánh giá
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/wishlist">
                    <i className="bi bi-heart me-2"></i>Yêu thích
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/loyalty">
                    <i className="bi bi-coin me-2"></i>Điểm tích lũy
                  </NavDropdown.Item>

                  <NavDropdown.Item as={Link} to="/viewed">
                    <i className="bi bi-clock-history me-2"></i>Sản phẩm đã xem
                  </NavDropdown.Item>

                  {isAdmin && (
                    <>
                      <NavDropdown.Divider />
                      <NavDropdown.Item
                        as={Link}
                        to="/admin/dashboard"
                        className="text-danger"
                      >
                        <i className="bi bi-shield-check me-2"></i>
                        <strong>Quản trị</strong>
                      </NavDropdown.Item>
                    </>
                  )}

                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <div className="auth-buttons">
                  <Button
                    as={Link}
                    to="/login"
                    variant="outline-primary"
                    size="sm"
                    className="rounded-pill"
                  >
                    <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                  </Button>

                  <Button
                    as={Link}
                    to="/register"
                    variant="primary"
                    size="sm"
                    className="rounded-pill"
                  >
                    <i className="bi bi-person-plus me-1"></i>Đăng ký
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
