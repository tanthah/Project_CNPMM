
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import notificationApi from '../api/notificationApi';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async (page = 1) => {
        const response = await notificationApi.getAll(page);
        return response.data;
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async () => {
        await notificationApi.markAllAsRead();
        return;
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id) => {
        await notificationApi.markAsRead(id);
        return id;
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        total: 0,
        loading: false
    },
    reducers: {
        addNotification: (state, action) => {
            const newItem = action.payload;
            // Check if exists
            const exists = state.items.some(i => i._id === newItem._id);
            if (!exists) {
                state.items.unshift(newItem);
                // Sort just in case socket event arrives out of order
                state.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                state.unreadCount += 1;
                state.total += 1;
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                // Backend already returns sorted list and total count
                state.items = action.payload.notifications;
                state.unreadCount = action.payload.unreadCount;
                state.total = action.payload.total;
                state.loading = false;
            })
            .addCase(fetchNotifications.rejected, (state) => {
                state.loading = false;
            })
            // Mark All Read
            .addCase(markAllAsRead.pending, (state) => {
                // Optimistic UI
                state.unreadCount = 0;
                state.items.forEach(item => item.isRead = true);
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                // Keep the optimistic update
            })
            .addCase(markAllAsRead.rejected, (state, action) => {
                console.error('API failed:', action.error);
                // Revert optimistic update on failure
                // We don't have previous state, so we need to refetch
                alert('Lỗi khi đánh dấu đã đọc. Vui lòng thử lại!');
            })
            // Mark One Read
            .addCase(markAsRead.fulfilled, (state, action) => {
                const item = state.items.find(i => i._id === action.payload);
                if (item && !item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            });
    }
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
