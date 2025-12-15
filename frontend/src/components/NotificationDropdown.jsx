// frontend/src/components/NotificationDropdown.jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markAsRead, markAllAsRead } from '../redux/notificationSlice';
import NotificationItem from './NotificationItem';
import './NotificationStyles.css';

const NotificationDropdown = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading, unreadCount } = useSelector((state) => state.notifications);
    const dropdownRef = useRef(null);

    useEffect(() => {
        // Fetch notifications when dropdown opens
        dispatch(fetchNotifications({ page: 1, limit: 10 }));

        // Click outside to close
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [dispatch, onClose]);

    const handleItemClick = (notification) => {
        if (!notification.isRead) {
            dispatch(markAsRead(notification._id));
        }
        onClose();
    };

    const handleMarkAllRead = (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("🖱️ Mark All Read clicked");
        dispatch(markAllAsRead())
            .unwrap()
            .then(() => {
                console.log("✅ Mark all read success");
            })
            .catch((err) => {
                console.error("❌ Mark all read failed:", err);
            });
    };

    const handleViewAll = () => {
        navigate('/notifications');
        onClose();
    };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-dropdown-header">
                <h3>Thông báo ({unreadCount})</h3>
                {unreadCount > 0 && (
                    <button type="button" className="mark-read-btn" onClick={handleMarkAllRead}>
                        Đánh dấu đã đọc
                    </button>
                )}
            </div>

            <div className="notification-dropdown-body">
                {loading && items.length === 0 ? (
                    <div className="notification-loading">Đang tải...</div>
                ) : items.length > 0 ? (
                    items.slice(0, 5).map(item => (
                        <NotificationItem
                            key={item._id}
                            notification={item}
                            onClick={handleItemClick}
                        />
                    ))
                ) : (
                    <div className="notification-empty">
                        <p>Chưa có thông báo nào</p>
                    </div>
                )}
            </div>

            <div className="notification-dropdown-footer">
                <button onClick={handleViewAll}>Xem tất cả</button>
            </div>
        </div>
    );
};

export default NotificationDropdown;
