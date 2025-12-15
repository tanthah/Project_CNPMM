// backend/src/sockets/socketHandler.js
let io;

export const initializeSocket = (socketIO) => {
    io = socketIO;

    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // User join room theo userId
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`👤 User ${userId} joined room: user_${userId}`);
        });

        // Disconnect
        socket.on('disconnect', () => {
            console.log('🔌 User disconnected:', socket.id);
        });
    });

    return io;
};

// Export io instance để dùng ở các service khác
export const getIO = () => {
    if (!io) {
        throw new Error('Socket.IO chưa được khởi tạo!');
    }
    return io;
};

// Utility: Emit notification đến 1 user cụ thể
export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
        console.log(`📤 Emitted '${event}' to user_${userId}`);
    }
};
