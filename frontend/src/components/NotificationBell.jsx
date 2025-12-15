// frontend/src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUnreadCount } from '../redux/notificationSlice';
import NotificationDropdown from './NotificationDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import './NotificationStyles.css';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const { unreadCount } = useSelector((state) => state.notifications);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (user) {
            dispatch(fetchUnreadCount());
        }
    }, [dispatch, user]);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    const closeDropdown = () => {
        setIsOpen(false);
    };

    if (!user) return null;

    return (
        <div className="notification-bell-container" onClick={toggleDropdown}>
            <div className="notification-bell-icon">
                <FontAwesomeIcon icon={faBell} />
            </div>
            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {isOpen && <NotificationDropdown onClose={closeDropdown} />}
        </div>
    );
};

export default NotificationBell;
