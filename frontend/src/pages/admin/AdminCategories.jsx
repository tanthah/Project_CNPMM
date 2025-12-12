// frontend/src/pages/admin/AdminCategories.jsx
import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Table, Badge, Spinner, Alert } from 'react-bootstrap';
import adminCategoryApi from '../../api/admin/adminCategoryApi';
import './css/AdminProducts.css';
import { useNotification } from '../../components/NotificationProvider';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalAlert, setModalAlert] = useState(null);
  const [modalAlertVariant, setModalAlertVariant] = useState('info');
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const notify = useNotification();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await adminCategoryApi.getAllCategories();
      setCategories(response.data.categories);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        isActive: category.isActive,
      });
      setImagePreview(category.image);
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true,
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
    setModalAlert(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setImageFile(null);
    setImagePreview(null);
    setError(null);
    setModalAlert(null);
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
    
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate
      if (!file.type.startsWith('image/')) {
        setModalAlertVariant('danger');
        setModalAlert('Vui lòng chọn file hình ảnh');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setModalAlertVariant('danger');
        setModalAlert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      setModalAlertVariant('danger');
      setModalAlert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setModalAlert(null);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('isActive', formData.isActive);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingCategory) {
        await adminCategoryApi.updateCategory(editingCategory._id, formDataToSend);
        setModalAlertVariant('success');
        setModalAlert('Cập nhật danh mục thành công!');
        notify.success('Cập nhật danh mục thành công!');
      } else {
        await adminCategoryApi.createCategory(formDataToSend);
        setModalAlertVariant('success');
        setModalAlert('Thêm danh mục thành công!');
        notify.success('Thêm danh mục thành công!');
      }
      
      await loadCategories();
      setTimeout(() => {
        handleCloseModal();
        setModalAlert(null);
      }, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Lỗi khi lưu danh mục';
      setModalAlertVariant('danger');
      setModalAlert(msg);
      notify.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await notify.confirm({ message: 'Bạn có chắc muốn xóa danh mục này?' });
    if (!ok) return;
    
    try {
      await adminCategoryApi.deleteCategory(id);
      setSuccess('Xóa danh mục thành công!');
      notify.success('Xóa danh mục thành công!');
      await loadCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xóa danh mục');
      notify.error(err.response?.data?.message || 'Lỗi khi xóa danh mục');
    }
  };

  const handleToggleStatus = async (id) => {
    // Optimistic update
    const idx = categories.findIndex((c) => c._id === id);
    if (idx === -1) return;
    const prev = categories[idx].isActive;
    const nextCategories = [...categories];
    nextCategories[idx] = { ...nextCategories[idx], isActive: !prev };
    setCategories(nextCategories);
    try {
      const res = await adminCategoryApi.toggleCategoryStatus(id);
      const msg = res?.data?.message || (nextCategories[idx].isActive ? 'Hiển thị danh mục' : 'Ẩn danh mục');
      notify.success(msg);
    } catch (err) {
      const revertCategories = [...nextCategories];
      revertCategories[idx] = { ...revertCategories[idx], isActive: prev };
      setCategories(revertCategories);
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật trạng thái';
      setError(msg);
      notify.error(msg);
    }
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
    <div className="admin-categories">
      {/* Header */}
      <div className="page-header mb-4">
        <div>
          <h2>Quản lý danh mục</h2>
          <p className="text-muted">Tổng số: {categories.length} danh mục</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm danh mục mới
        </Button>
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

      {/* Categories Table */}
      <div className="card">
        <Table responsive hover>
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Hình ảnh</th>
              <th>Tên danh mục</th>
              <th>Slug</th>
              <th>Mô tả</th>
              <th>Trạng thái</th>
              <th style={{ width: '150px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category._id}>
                  <td>
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="category-thumb"
                      />
                    ) : (
                      <div className="category-thumb no-image">
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>
                    <code>{category.slug}</code>
                  </td>
                  <td>
                    <small className="text-muted">
                      {category.description || '---'}
                    </small>
                  </td>
                  <td>
                    <Form.Check
                      type="switch"
                      checked={category.isActive}
                      onChange={() => handleToggleStatus(category._id)}
                    />
                  </td>
                  <td>
                    <div className="btn-group-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleOpenModal(category)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(category._id)}
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

      {/* Category Form Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalAlert && (
            <Alert variant={modalAlertVariant} className="mb-3" onClose={() => setModalAlert(null)} dismissible>
              {modalAlert}
            </Alert>
          )}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên danh mục"
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
                placeholder="slug-danh-muc"
                required
              />
              <Form.Text className="text-muted">
                Tự động tạo từ tên danh mục
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
                placeholder="Mô tả chi tiết danh mục"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="image-preview"
                  />
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                name="isActive"
                label="Hiển thị danh mục"
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
                {editingCategory ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
