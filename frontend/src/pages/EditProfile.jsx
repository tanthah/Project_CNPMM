// frontend/src/pages/EditProfile.jsx - COMPLETE VERSION
import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Image, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  uploadAvatar, 
  clearMessages 
} from '../redux/editUserSlice';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateDateOfBirth,
  validateGender,
  validateImageFile,
  sanitizeFormData
} from '../utils/validation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../components/NotificationProvider';

const EditProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const notify = useNotification();
  
  const { user, loading, updating, uploadingAvatar, error, success, successMessage } = useSelector(
    (state) => state.editUser
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'other'
  });

  const [avatarPreview, setAvatarPreview] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Load user profile when component mounts
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || 'other'
      });
      
      // Set avatar preview
      if (user.avatar) {
        if (user.avatar.startsWith('http')) {
          setAvatarPreview(user.avatar);
        }
      }
    }
  }, [user]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const dobError = validateDateOfBirth(formData.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;
    
    const genderError = validateGender(formData.gender);
    if (genderError) errors.gender = genderError;
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'dateOfBirth':
        error = validateDateOfBirth(value);
        break;
      case 'gender':
        error = validateGender(value);
        break;
      default:
        break;
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    const fieldError = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileError = validateImageFile(file);
      if (fileError) {
        notify.error(fileError);
        return;
      }

      // Preview image locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via backend
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);
      
      try {
        const result = await dispatch(uploadAvatar(formDataUpload)).unwrap();
        if (result.avatar) {
          setAvatarPreview(result.avatar);
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const sanitizedData = sanitizeFormData(formData);
      await dispatch(updateUserProfile(sanitizedData)).unwrap();
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status" variant="primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <Container className="py-5" style={{ flex: 1 }}>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6}>
            <Card className="shadow-lg border-0">
              <Card.Header className="bg-primary text-white py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">
                    <i className="bi bi-person-circle me-2"></i>
                    Chỉnh Sửa Hồ Sơ
                  </h4>
                  <Link to="/review-profile" className="btn btn-light btn-sm">
                    <i className="bi bi-arrow-left me-1"></i> Quay lại
                  </Link>
                </div>
              </Card.Header>
              
              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" dismissible onClose={() => dispatch(clearMessages())}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </Alert>
                )}

                {success && (
                  <Alert variant="success" dismissible onClose={() => dispatch(clearMessages())}>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    {successMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit} noValidate>
                  {/* Avatar Section */}
                  <div className="text-center mb-4">
                    <div 
                      onClick={handleAvatarClick} 
                      style={{ 
                        cursor: 'pointer', 
                        position: 'relative', 
                        display: 'inline-block' 
                      }}
                    >
                      <Image
                        src={avatarPreview || 'https://via.placeholder.com/150?text=Avatar'}
                        roundedCircle
                        style={{ 
                          width: '200px', 
                          height: '200px', 
                          objectFit: 'cover',
                          border: '4px solid #0d6efd',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                        }}
                      />
                      {uploadingAvatar && (
                        <div 
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            borderRadius: '50%'
                          }}
                        >
                          <Spinner animation="border" variant="light" />
                        </div>
                      )}
                      <div 
                        style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          backgroundColor: '#0d6efd',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '3px solid white'
                        }}
                      >
                        <i className="bi bi-camera-fill"></i>
                      </div>
                    </div>
                    <div className="mt-2">
                      <small className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Nhấp vào ảnh để thay đổi (JPG, PNG, GIF, WEBP - Tối đa 5MB)
                      </small>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <Row>
                    {/* Name Field */}
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="formName">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-person me-2"></i>
                          Họ và Tên <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Nhập họ và tên (2-50 ký tự)"
                          required
                          isInvalid={!!formErrors.name}
                          disabled={updating}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Email Field */}
                    <Col md={12}>
                      <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-envelope me-2"></i>
                          Email <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@email.com"
                          required
                          isInvalid={!!formErrors.email}
                          disabled={updating}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    {/* Phone Field */}
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formPhone">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-telephone me-2"></i>
                          Số Điện Thoại
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="0912345678"
                          isInvalid={!!formErrors.phone}
                          disabled={updating}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.phone}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Không bắt buộc
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Date of Birth Field */}
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formDateOfBirth">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-calendar me-2"></i>
                          Ngày Sinh
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.dateOfBirth}
                          disabled={updating}
                          max={new Date().toISOString().split('T')[0]}
                        />
                        <Form.Control.Feedback type="invalid">
                          {formErrors.dateOfBirth}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                          Không bắt buộc (Từ 13 tuổi)
                        </Form.Text>
                      </Form.Group>
                    </Col>

                    {/* Gender Field */}
                    <Col md={12}>
                      <Form.Group className="mb-4" controlId="formGender">
                        <Form.Label className="fw-bold">
                          <i className="bi bi-gender-ambiguous me-2"></i>
                          Giới Tính
                        </Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          isInvalid={!!formErrors.gender}
                          disabled={updating}
                        >
                          <option value="male">Nam</option>
                          <option value="female">Nữ</option>
                          <option value="other">Khác</option>
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {formErrors.gender}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Submit Button */}
                  <div className="d-grid gap-2">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      size="lg"
                      disabled={updating || uploadingAvatar}
                    >
                      {updating ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Lưu Thay Đổi
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* User Info Card */}
            {user && (
              <Card className="mt-3 shadow-sm border-0">
                <Card.Body>
                  <h6 className="text-muted mb-3">Thông tin tài khoản</h6>
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">ID:</small>
                    <small className="text-end font-monospace">{user._id}</small>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <small className="text-muted">Vai trò:</small>
                    <small className="text-end">
                      <span className="badge bg-info">{user.role || 'user'}</span>
                    </small>
                  </div>
                  <div className="d-flex justify-content-between">
                    <small className="text-muted">Ngày tạo:</small>
                    <small className="text-end">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default EditProfile;
