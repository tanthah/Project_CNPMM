// frontend/src/contexts/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { token, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // Chỉ kết nối khi user đăng nhập
        if (token && user) {
            const socketURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

            const newSocket = io(socketURL, {
                auth: {
                    token
                },
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 1000
            });

            newSocket.on('connect', () => {
                console.log('🔌 Socket connected:', newSocket.id);
                setIsConnected(true);

                // Join user room
                newSocket.emit('join_user_room', user.id);
            });

            newSocket.on('disconnect', () => {
                console.log('🔌 Socket disconnected');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('🔌 Socket connection error:', error);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            // Disconnect nếu logout
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
        }
    }, [token, user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
