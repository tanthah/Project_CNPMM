// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from '../../api/axios';
import './css/AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      // You can create API endpoints for these statistics
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        axios.get('/admin/products'),
        axios.get('/admin/categories'),
        axios.get('/orders') // Reuse existing endpoint
      ]);

      setStats({
        totalProducts: productsRes.data.pagination?.total || 0,
        totalCategories: categoriesRes.data.pagination?.total || 0,
        totalOrders: ordersRes.data.orders?.length || 0,
        newOrders: ordersRes.data.orders?.filter(o => o.status === 'new').length || 0
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
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
    <div className="admin-dashboard">
      <h2 className="mb-4">Tổng quan hệ thống</h2>
      
      <Row className="g-4">
        <Col md={6} lg={3}>
          <Card className="stat-card stat-card-primary">
            <Card.Body>
              <div className="stat-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalProducts || 0}</h3>
                <p>Tổng sản phẩm</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card stat-card-success">
            <Card.Body>
              <div className="stat-icon">
                <i className="bi bi-grid"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalCategories || 0}</h3>
                <p>Danh mục</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card stat-card-warning">
            <Card.Body>
              <div className="stat-icon">
                <i className="bi bi-receipt"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.totalOrders || 0}</h3>
                <p>Tổng đơn hàng</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3}>
          <Card className="stat-card stat-card-danger">
            <Card.Body>
              <div className="stat-icon">
                <i className="bi bi-exclamation-circle"></i>
              </div>
              <div className="stat-content">
                <h3>{stats?.newOrders || 0}</h3>
                <p>Đơn hàng mới</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4 mt-4">
        <Col lg={12}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Chức năng quản lý</h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={4}>
                  <div className="quick-link" onClick={() => window.location.href = '/admin/products'}>
                    <i className="bi bi-box-seam"></i>
                    <span>Quản lý sản phẩm</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="quick-link" onClick={() => window.location.href = '/admin/categories'}>
                    <i className="bi bi-grid"></i>
                    <span>Quản lý danh mục</span>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="quick-link" onClick={() => window.location.href = '/admin/orders'}>
                    <i className="bi bi-receipt"></i>
                    <span>Quản lý đơn hàng</span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}