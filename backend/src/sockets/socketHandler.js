// backend/src/sockets/socketHandler.js
let io;

export const initializeSocket = (socketIO) => {
    io = socketIO;

    io.on('connection', (socket) => {
        // console.log('🔌 User connected:', socket.id);

        // User join room theo userId (existing)
        socket.on('join_user_room', (userId) => {
            socket.join(`user_${userId}`);
            // console.log(`👤 User ${userId} joined room: user_${userId}`);
        });

        // --- CHAT SUPPORT LOGIC ---

        // 1. User joins chat
        socket.on('join_chat', (userData) => {
            const { userId, name } = userData;
            socket.join(`chat_${userId}`); // Room riêng cho user này

            // Notify admin
            io.to('admin_room').emit('new_chat_request', {
                userId,
                name,
                socketId: socket.id,
                message: 'Khách hàng yêu cầu hỗ trợ'
            });
            // io.to('admin_room').emit('new_chat_request', {
            //     userId,
            //     name,
            //     socketId: socket.id,
            //     message: 'Khách hàng yêu cầu hỗ trợ'
            // });
            // console.log(`💬 User ${userId} (${name}) joined chat support`);
        });

        // 2. User sends message
        socket.on('send_message', (data) => {
            const { userId, message, name } = data;
            // Gửi cho admin
            io.to('admin_room').emit('receive_message', {
                userId,
                name,
                message,
                from: 'user',
                timestamp: new Date()
            });
            // console.log(`📩 Message from ${name}: ${message}`);
        });

        // 3. Admin joins admin room
        socket.on('admin_join_chat', () => {
            socket.join('admin_room');
            // console.log('🛡️ Admin joined chat support room');
        });

        // 4. Admin replies
        socket.on('admin_reply', (data) => {
            const { userId, message } = data;
            // Gửi lại cho room của user
            io.to(`chat_${userId}`).emit('receive_message', {
                message,
                from: 'bot', // hoặc 'admin'
                timestamp: new Date()
            });
            // console.log(`📨 Admin replied to ${userId}: ${message}`);
        });

        // --- END CHAT SUPPORT LOGIC ---

        // Disconnect
        socket.on('disconnect', () => {
            // console.log('🔌 User disconnected:', socket.id);
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
    }
};
