// frontend/src/pages/admin/AdminProducts.jsx - FIXED
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Badge, Spinner, Alert, InputGroup } from 'react-bootstrap';
import adminProductApi from '../../api/admin/adminProductApi';
import adminCategoryApi from '../../api/admin/adminCategoryApi';
import productApi from '../../api/productApi';
import MediaUpload from '../../components/admin/MediaUpload';
import './css/AdminProducts.css';
import { useNotification } from '../../components/NotificationProvider';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalAlert, setModalAlert] = useState(null);
  const [modalAlertVariant, setModalAlertVariant] = useState('info');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discount: 0,
    stock: '',
    categoryId: '',
    brand: '',
    attributes: {},
    isActive: true,
  });
  
  const [media, setMedia] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const AdminProductSearchResults = React.lazy(() => import('../../components/admin/AdminProductSearchResults'));
  const [showSuggest, setShowSuggest] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [brandSuggestions, setBrandSuggestions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        adminProductApi.getAllProducts(),
        adminCategoryApi.getAllCategories() // ✅ Fixed: use correct API
      ]);
      
      console.log('Products:', productsRes.data);
      console.log('Categories:', categoriesRes.data);
      
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        description: product.description || '',
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock,
        categoryId: product.categoryId?._id || '',
        brand: product.brand || '',
        attributes: product.attributes || {},
        isActive: product.isActive,
      });
      setMedia(product.images?.map(url => ({ url, type: 'image' })) || []);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        discount: 0,
        stock: '',
        categoryId: '',
        brand: '',
        attributes: {},
        isActive: true,
      });
      setMedia([]);
    }
    setShowModal(true);
    setError(null);
    setModalAlert(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError(null);
    setModalAlert(null);
  };

  const normalize = (s) => s?.toLowerCase()?.normalize('NFD')?.replace(/\p{Diacritic}+/gu, '') || '';

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setShowSuggest(false);
      setProductSuggestions([]);
      setCategorySuggestions([]);
      setBrandSuggestions([]);
      return;
    }
    setShowSuggest(true);
    setSuggestLoading(true);
    productApi.suggest(q, 8)
      .then(res => {
        setProductSuggestions(res.data.suggestions || []);
      })
      .catch(() => {
        setProductSuggestions([]);
      })
      .finally(() => {
        setSuggestLoading(false);
      });
    const nq = normalize(q);
    const catSugs = categories.filter(c => normalize(c.name).includes(nq)).slice(0, 8);
    setCategorySuggestions(catSugs);
    const brands = Array.from(new Set((products || []).map(p => p.brand).filter(Boolean)));
    const brandSugs = brands.filter(b => normalize(b).includes(nq)).slice(0, 8);
    setBrandSuggestions(brandSugs);
  }, [searchQuery, categories, products]);

  const applyCategorySuggestion = async (cat) => {
    try {
      setSearching(true);
      const res = await adminProductApi.getAllProducts(1, 50, '', { categoryId: cat._id });
      setSearchResults(res.data.products || []);
      setShowSearch(true);
      setShowSuggest(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi tìm theo danh mục';
      setSearchError(msg);
      setShowSearch(false);
    } finally {
      setSearching(false);
    }
  };

  const applyBrandSuggestion = async (brand) => {
    setSearchQuery(brand);
    await handleSearch();
    setShowSuggest(false);
  };

  const applyProductSuggestion = async (s) => {
    setSearchQuery(s.name);
    await handleSearch();
    setShowSuggest(false);
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      setModalAlertVariant('danger');
      setModalAlert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    if (media.length === 0) {
      setModalAlertVariant('danger');
      setModalAlert('Vui lòng tải lên ít nhất 1 hình ảnh');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setModalAlert(null);
      
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        if (key === 'attributes') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Append media files
      media.forEach((item, index) => {
        if (item.file) {
          formDataToSend.append('media', item.file);
        } else if (item.url) {
          // Existing media (for update)
          formDataToSend.append('existingMedia', item.url);
        }
      });

      if (editingProduct) {
        await adminProductApi.updateProduct(editingProduct._id, formDataToSend);
        setModalAlertVariant('success');
        setModalAlert('Cập nhật sản phẩm thành công!');
        notify.success('Cập nhật sản phẩm thành công!');
      } else {
        await adminProductApi.createProduct(formDataToSend);
        setModalAlertVariant('success');
        setModalAlert('Thêm sản phẩm thành công!');
        notify.success('Thêm sản phẩm thành công!');
      }
      
      await loadData();
      setTimeout(() => {
        handleCloseModal();
        setModalAlert(null);
      }, 1200);
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || 'Lỗi khi lưu sản phẩm';
      setModalAlertVariant('danger');
      setModalAlert(msg);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await notify.confirm({ message: 'Bạn có chắc muốn xóa sản phẩm này?' });
    if (!ok) return;
    
    try {
      await adminProductApi.deleteProduct(id);
      setSuccess('Xóa sản phẩm thành công!');
      notify.success('Xóa sản phẩm thành công!');
      await loadData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
      notify.error(err.response?.data?.message || 'Lỗi khi xóa sản phẩm');
    }
  };

  const handleToggleStatus = async (id) => {
    // Optimistic update
    const idx = products.findIndex((p) => p._id === id);
    if (idx === -1) return;
    const prev = products[idx].isActive;
    const nextProducts = [...products];
    nextProducts[idx] = { ...nextProducts[idx], isActive: !prev };
    setProducts(nextProducts);
    try {
      const res = await adminProductApi.toggleProductStatus(id);
      const msg = res?.data?.message || (nextProducts[idx].isActive ? 'Hiển thị sản phẩm' : 'Ẩn sản phẩm');
      notify.success(msg);
    } catch (err) {
      // Revert on failure
      const revertProducts = [...nextProducts];
      revertProducts[idx] = { ...revertProducts[idx], isActive: prev };
      setProducts(revertProducts);
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
      setError(msg);
      notify.error(msg);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault?.();
    const q = searchQuery.trim();
    if (!q) {
      setSearchError('Vui lòng nhập từ khóa tìm kiếm');
      setShowSearch(true);
      setSearchResults([]);
      return;
    }
    try {
      setSearching(true);
      setSearchError(null);
      const res = await adminProductApi.getAllProducts(1, 50, q);
      const results = res.data.products || [];
      setSearchResults(results);
      setShowSearch(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi tìm kiếm sản phẩm';
      setSearchError(msg);
      notify.error(msg);
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearch(false);
    setSearchError(null);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Quản lý sản phẩm</h2>
          <p className="text-muted">Tổng số: {products.length} sản phẩm</p>
        </div>
        <div className="d-flex align-items-center gap-2 position-relative" style={{ minHeight: '40px' }}>
          <div className="position-relative" style={{ minWidth: '420px' }}>
            <Form onSubmit={handleSearch} className="d-none d-md-block">
              <InputGroup>
                <Form.Control
                  placeholder="Tìm kiếm tên, thương hiệu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery.trim() && setShowSuggest(true)}
                  onBlur={() => setTimeout(() => setShowSuggest(false), 180)}
                />
                <Button variant="outline-secondary" type="submit" disabled={searching}>
                  {searching ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <i className="bi bi-search"></i>
                  )}
                </Button>
              </InputGroup>
            </Form>
            {showSuggest && (
              <div className="position-absolute w-100" style={{ top: '100%', left: 0, zIndex: 1000 }}>
                <div className="card p-2 shadow">
                  {suggestLoading ? (
                    <div className="text-center py-2"><Spinner animation="border" size="sm" /></div>
                  ) : (
                    <>
                      {categorySuggestions.length > 0 && (
                        <div className="mb-2">
                          <div className="text-muted small mb-1">Danh mục</div>
                          {categorySuggestions.map(cat => (
                            <Button key={cat._id} variant="light" className="w-100 text-start" onClick={() => applyCategorySuggestion(cat)}>
                              {cat.name}
                            </Button>
                          ))}
                        </div>
                      )}
                      {brandSuggestions.length > 0 && (
                        <div className="mb-2">
                          <div className="text-muted small mb-1">Thương hiệu</div>
                          {brandSuggestions.map(b => (
                            <Button key={b} variant="light" className="w-100 text-start" onClick={() => applyBrandSuggestion(b)}>
                              {b}
                            </Button>
                          ))}
                        </div>
                      )}
                      {productSuggestions.length > 0 && (
                        <div>
                          <div className="text-muted small mb-1">Sản phẩm</div>
                          {productSuggestions.map(s => (
                            <Button key={s.id} variant="light" className="w-100 text-start" onClick={() => applyProductSuggestion(s)}>
                              {s.name} {s.brand ? `• ${s.brand}` : ''}
                            </Button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <i className="bi bi-plus-circle me-2"></i>
            Thêm sản phẩm mới
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search Results */}
      {showSearch && (
        <React.Suspense fallback={<div className="text-center py-3"><Spinner animation="border" /></div>}>
          <AdminProductSearchResults
            results={searchResults}
            onClear={clearSearch}
            onEdit={(p) => handleOpenModal(p)}
            onDelete={(id) => handleDelete(id)}
            onToggle={(id) => handleToggleStatus(id)}
          />
        </React.Suspense>
      )}

      {/* Products Table */}
      <div className="card">
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Hình ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Giảm giá</th>
                <th>Tồn kho</th>
                <th>Trạng thái</th>
                <th style={{ width: '150px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Chưa có sản phẩm nào
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img 
                        src={product.images?.[0] || '/placeholder.jpg'} 
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td>
                      <strong>{product.name}</strong>
                      <br />
                      <small className="text-muted">{product.brand}</small>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {product.categoryId?.name || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      <strong className="text-danger">
                        {product.finalPrice?.toLocaleString('vi-VN')}đ
                      </strong>
                      {product.discount > 0 && (
                        <>
                          <br />
                          <small className="text-muted text-decoration-line-through">
                            {product.price?.toLocaleString('vi-VN')}đ
                          </small>
                        </>
                      )}
                    </td>
                    <td>
                      {product.discount > 0 && (
                        <Badge bg="danger">-{product.discount}%</Badge>
                      )}
                    </td>
                    <td>
                      <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                        {product.stock}
                      </Badge>
                    </td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={product.isActive}
                        onChange={() => handleToggleStatus(product._id)}
                      />
                    </td>
                    <td>
                      <div className="btn-group-actions">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenModal(product)}
                          title="Sửa"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          title="Xóa"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAlert && (
            <Alert variant={modalAlertVariant} className="mb-3" onClose={() => setModalAlert(null)} dismissible>
              {modalAlert}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <h6 className="mb-3">Thông tin cơ bản</h6>
            
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                placeholder="slug-san-pham"
                required
              />
              <Form.Text className="text-muted">
                Tự động tạo từ tên sản phẩm
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết sản phẩm"
              />
            </Form.Group>

            {/* Pricing */}
            <h6 className="mb-3 mt-4">Giá & Tồn kho</h6>
            
            <div className="row">
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Giá gốc <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="100000"
                    required
                    min="0"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Giảm giá (%)</Form.Label>
                  <Form.Control
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-3">
                  <Form.Label>Tồn kho <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="100"
                    required
                    min="0"
                  />
                </Form.Group>
              </div>
            </div>

            {/* Category & Brand */}
            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </Form.Select>
                  {categories.length === 0 && (
                    <Form.Text className="text-warning">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      Chưa có danh mục nào. Vui lòng tạo danh mục trước.
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Thương hiệu</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Apple, Samsung..."
                  />
                </Form.Group>
              </div>
            </div>

            {/* Media Upload */}
            <h6 className="mb-3 mt-4">Hình ảnh & Video</h6>
            <MediaUpload
              media={media}
              onMediaChange={setMedia}
              maxFiles={10}
              acceptVideo={true}
            />

            {/* Status */}
            <Form.Group className="mb-3 mt-4">
              <Form.Check
                type="switch"
                name="isActive"
                label="Hiển thị sản phẩm"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <i className="bi bi-check me-2"></i>
                {editingProduct ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
