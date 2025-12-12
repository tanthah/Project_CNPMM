// frontend/src/components/admin/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import './css/AdminLayout.css';
import { useNotification } from '../NotificationProvider';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const notify = useNotification();

  const menuItems = [
    {
      icon: 'bi-speedometer2',
      label: 'Dashboard',
      path: '/admin/dashboard',
    },
    {
      icon: 'bi-box-seam',
      label: 'Sản phẩm',
      path: '/admin/products',
    },
    {
      icon: 'bi-grid',
      label: 'Danh mục',
      path: '/admin/categories',
    },
    {
      icon: 'bi-receipt',
      label: 'Đơn hàng',
      path: '/admin/orders',
    },
    {
      icon: 'bi-people',
      label: 'Người dùng',
      path: '/admin/users',
    },
    {
      icon: 'bi-star',
      label: 'Đánh giá',
      path: '/admin/reviews',
    },
    {
      icon: 'bi-ticket-perforated',
      label: 'Mã giảm giá',
      path: '/admin/coupons',
    },
    {
      icon: 'bi-bar-chart',
      label: 'Thống kê',
      path: '/admin/statistics',
    },
  ];

  const handleLogout = async () => {
    const ok = await notify.confirm({ message: 'Bạn có chắc muốn đăng xuất?' });
    if (!ok) return;
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <i className="bi bi-shop"></i>
            {!sidebarCollapsed && <span>Admin Panel</span>}
          </div>
          <button
            className="toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className={`bi bi-chevron-${sidebarCollapsed ? 'right' : 'left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <i className="bi bi-person-circle"></i>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <strong>{user?.name}</strong>
                <small>Administrator</small>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right"></i>
            {!sidebarCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-topbar">
          <div className="page-title">
            <h1>
              {menuItems.find((item) => item.path === location.pathname)?.label || 'Admin'}
            </h1>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" onClick={() => navigate('/')}>
              <i className="bi bi-house"></i>
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
