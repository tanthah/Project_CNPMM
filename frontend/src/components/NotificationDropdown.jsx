
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllAsRead, markAsRead } from '../redux/notificationSlice';
import NotificationItem from './NotificationItem';
import { useNavigate } from 'react-router-dom';
import './NotificationStyles.css';

const NotificationDropdown = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { items, loading, unreadCount } = useSelector((state) => state.notifications);
    const dropdownRef = useRef(null);

    // Fetch on mount REMOVED - handled by NotificationBell
    // useEffect(() => {
    //     dispatch(fetchNotifications(1));
    // }, [dispatch]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleMarkAllRead = async () => {
        await dispatch(markAllAsRead()).unwrap();
    };

    const handleItemClick = (notification) => {
        if (!notification.isRead) {
            dispatch(markAsRead(notification._id));
        }
        if (notification.link) {
            navigate(notification.link);
        }
        onClose();
    };

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <div className="notification-header">
                <span>Thông báo ({unreadCount})</span>
                {unreadCount > 0 && (
                    <button className="mark-read-btn" onClick={handleMarkAllRead}>
                        Đánh dấu đã đọc
                    </button>
                )}
            </div>
            <div className="notification-list">
                {loading && items.length === 0 ? (
                    <div className="empty-notification">Đang tải...</div>
                ) : items.length > 0 ? (
                    items.map(item => (
                        <NotificationItem
                            key={item._id}
                            notification={item}
                            onClick={handleItemClick}
                        />
                    ))
                ) : (
                    <div className="empty-notification">Không có thông báo nào</div>
                )}
            </div>
            <div className="notification-footer" onClick={() => { navigate('/orders'); onClose(); }}>
                Xem tất cả đơn hàng
            </div>
        </div>
    );
};

export default NotificationDropdown;
