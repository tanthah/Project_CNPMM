import React, { useState } from 'react'
import { Modal, Form, Row, Col, Button } from 'react-bootstrap'
import addressApi from '../api/addressApi'
import { useNotification } from './NotificationProvider'

export default function AddAddressModal({ show, onHide, onAdded }) {
  const notify = useNotification()
  const [loading, setLoading] = useState(false)
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    addressLine: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false
  })

  const handleSubmit = async () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine || !newAddress.ward || !newAddress.district || !newAddress.city) {
      notify.info('Vui lòng điền đầy đủ thông tin địa chỉ')
      return
    }
    try {
      setLoading(true)
      await addressApi.createAddress(newAddress)
      notify.success('Đã thêm địa chỉ mới')
      setNewAddress({
        fullName: '',
        phone: '',
        addressLine: '',
        ward: '',
        district: '',
        city: '',
        isDefault: false
      })
      if (onAdded) onAdded()
    } catch (err) {
      notify.error(err.response?.data?.message || 'Lỗi khi thêm địa chỉ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Thêm địa chỉ mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Họ và tên <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.fullName}
                  onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                  placeholder="Nhập họ và tên"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.phone}
                  onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                  placeholder="Nhập số điện thoại"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Địa chỉ cụ thể <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              value={newAddress.addressLine}
              onChange={(e) => setNewAddress({ ...newAddress, addressLine: e.target.value })}
              placeholder="Số nhà, tên đường..."
            />
          </Form.Group>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.ward}
                  onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                  placeholder="Phường/Xã"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.district}
                  onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                  placeholder="Quận/Huyện"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  placeholder="Tỉnh/Thành phố"
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            label="Đặt làm địa chỉ mặc định"
            checked={newAddress.isDefault}
            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
          />
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Đang thêm...' : 'Thêm địa chỉ'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

