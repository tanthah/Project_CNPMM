// frontend/src/components/ToastNotification.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSocket } from '../contexts/SocketContext';
import { addNotification } from '../redux/notificationSlice';
import { useNavigate } from 'react-router-dom';

const ToastNotification = () => {
    const { socket } = useSocket();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (!socket) return;

        socket.on('new_notification', (notification) => {
            // 1. Add to Redux state
            dispatch(addNotification(notification));

            // 2. Show toast
            toast.info(
                <div onClick={() => notification.link && navigate(notification.link)}>
                    <strong>{notification.title}</strong>
                    <p style={{ margin: '5px 0 0', fontSize: '13px' }}>{notification.message}</p>
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    style: { cursor: notification.link ? 'pointer' : 'default' }
                }
            );
        });

        return () => {
            socket.off('new_notification');
        };
    }, [socket, dispatch, navigate]);

    return <ToastContainer />;
};

export default ToastNotification;
