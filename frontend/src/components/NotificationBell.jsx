
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../contexts/SocketContext';
import { fetchNotifications, addNotification } from '../redux/notificationSlice';
import NotificationDropdown from './NotificationDropdown';
import './NotificationStyles.css';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { unreadCount } = useSelector((state) => state.notifications);
    const dispatch = useDispatch();
    const { socket } = useSocket();

    // Init fetch
    useEffect(() => {
        dispatch(fetchNotifications(1));
    }, [dispatch]);

    // Socket listener
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = (notification) => {
            // Add to redux store (real-time update)
            dispatch(addNotification(notification));
        };

        socket.on('new_notification', handleNewNotification);

        return () => {
            socket.off('new_notification', handleNewNotification);
        };
    }, [socket, dispatch]);

    return (
        <div className="notification-bell-container" onClick={() => setIsOpen(!isOpen)}>
            <i className={`bi ${isOpen ? 'bi-bell-fill' : 'bi-bell'} notification-bell-icon`}></i>
            {unreadCount > 0 && (
                <span className="notification-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}
            {isOpen && (
                <div onClick={(e) => e.stopPropagation()}>
                    <NotificationDropdown onClose={() => setIsOpen(false)} />
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
