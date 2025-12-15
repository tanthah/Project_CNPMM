// frontend/src/components/NotificationItem.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faCheckCircle,
    faTruck,
    faTimesCircle,
    faTicketAlt,
    faComment,
    faGift,
    faBell,
    faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';
import './NotificationStyles.css';

const NotificationItem = ({ notification, onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) onClick(notification);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_confirmed': return <FontAwesomeIcon icon={faClipboardCheck} className="text-primary" />;
            case 'order_shipping': return <FontAwesomeIcon icon={faTruck} className="text-info" />;
            case 'order_completed': return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />;
            case 'order_cancelled': return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />;
            case 'coupon_received': return <FontAwesomeIcon icon={faTicketAlt} className="text-warning" />;
            case 'comment_reply': return <FontAwesomeIcon icon={faComment} className="text-secondary" />;
            case 'loyalty_points': return <FontAwesomeIcon icon={faGift} className="text-danger" />;
            default: return <FontAwesomeIcon icon={faBell} className="text-muted" />;
        }
    };

    return (
        <div
            className={`notification-item ${!notification.isRead ? 'unread' : 'read'}`}
            onClick={handleClick}
        >
            <div className="notification-icon">
                {getIcon(notification.type)}
            </div>
            <div className="notification-content">
                <div className="notification-header">
                    <span className="notification-title">{notification.title}</span>
                    <span className="notification-time">{notification.timeAgo}</span>
                </div>
                <p className="notification-message">{notification.message}</p>
            </div>
            {!notification.isRead && <div className="notification-dot" />}
        </div>
    );
};

export default NotificationItem;
