
import React from 'react';
import './NotificationStyles.css';

const NotificationItem = ({ notification, onClick }) => {
    // Helper to get icon
    const getIcon = (type) => {
        switch (type) {
            case 'order_confirmed': return 'bi-check-circle-fill text-success';
            case 'order_shipping': return 'bi-truck text-primary';
            case 'order_cancelled': return 'bi-x-circle-fill text-danger';
            case 'order_completed': return 'bi-star-fill text-warning';
            default: return 'bi-bell-fill text-secondary';
        }
    };

    // Format time
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
        });
    };

    return (
        <div
            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
            onClick={() => onClick(notification)}
        >
            <div className="notification-icon-wrapper">
                <i className={`bi ${getIcon(notification.type)}`}></i>
            </div>
            <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTime(notification.createdAt)}</div>
            </div>
            {!notification.isRead && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#007bff', marginTop: 6 }}></div>
            )}
        </div>
    );
};

export default NotificationItem;
