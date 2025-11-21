import React, { useState, useEffect, useRef } from 'react';
import { Container, Form, Button, Alert, Card, Row, Col, Image, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchUserProfile, 
  updateUserProfile, 
  uploadAvatar, 
  clearMessages 
} from '../redux/editUserSlice';

const EditProfile = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  const { user, loading, updating, uploadingAvatar, error, success, successMessage } = useSelector(
    (state) => state.user
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'other'
  });

  const [avatarPreview, setAvatarPreview] = useState('');

  // Load user profile khi component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Update form data khi user data thay đổi
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || 'other'
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  // Clear messages sau 3 giây
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      // Kiểm tra định dạng file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh');
        return;
      }

      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước ảnh không được vượt quá 5MB');
        return;
      }

      // Preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload ảnh
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);
      dispatch(uploadAvatar(formDataUpload));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên');
      return;
    }

    if (!formData.email.trim()) {
      alert('Vui lòng nhập email');
      return;
    }

    dispatch(updateUserProfile(formData));
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={0} lg={0}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Chỉnh Sửa Thông Tin Cá Nhân</h4>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" dismissible onClose={() => dispatch(clearMessages())}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" dismissible onClose={() => dispatch(clearMessages())}>
                  {successMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
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
                      src={avatarPreview || 'https://via.placeholder.com/150'}
                      roundedCircle
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover',
                        border: '3px solid #0d6efd'
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
                          backgroundColor: 'rgba(0,0,0,0.5)',
                          borderRadius: '50%'
                        }}
                      >
                        <Spinner animation="border" variant="light" />
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Nhấp vào ảnh để thay đổi</small>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Name Field */}
                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label>Họ và Tên <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </Form.Group>

                {/* Email Field */}
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Nhập email"
                    required
                   
                  />
                  
                </Form.Group>

                {/* Phone Field */}
                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Số Điện Thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                </Form.Group>

                {/* Date of Birth Field */}
                <Form.Group className="mb-3" controlId="formDateOfBirth">
                  <Form.Label>Ngày Sinh</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {/* Gender Field */}
                <Form.Group className="mb-4" controlId="formGender">
                  <Form.Label>Giới Tính</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </Form.Select>
                </Form.Group>

                {/* Submit Button */}
                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    size="lg"
                    disabled={updating}
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
                      'Lưu Thay Đổi'
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProfile;