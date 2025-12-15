// frontend/src/redux/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationApi from '../api/notificationApi';

// Async thunks
export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({ page = 1, limit = 10, unreadOnly = false }, { rejectWithValue }) => {
        try {
            const response = await notificationApi.getNotifications(page, limit, unreadOnly);
            return response;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi tải thông báo');
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (_, { rejectWithValue }) => {
        try {
            const response = await notificationApi.getUnreadCount();
            return response.count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi đếm thông báo');
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await notificationApi.markAsRead(id);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật');
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { rejectWithValue }) => {
        try {
            await notificationApi.markAllAsRead();
            return;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lỗi khi cập nhật');
        }
    }
);

const initialState = {
    items: [],
    unreadCount: 0,
    total: 0,
    page: 1,
    totalPages: 1,
    loading: false,
    error: null
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // Action khi nhận realtime notification từ socket
        addNotification: (state, action) => {
            // Add new notification to top
            state.items.unshift(action.payload);
            state.unreadCount += 1;
            state.total += 1;

            // Keep only recent 50 items locally to prevent memory issues if needed
            if (state.items.length > 50) {
                state.items.pop();
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.total = 0;
        }
    },
    extraReducers: (builder) => {
        // fetchNotifications
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false;
                // Nếu là page 1, replace items
                if (action.meta.arg.page === 1) {
                    state.items = action.payload.notifications;
                } else {
                    // Append items
                    state.items = [...state.items, ...action.payload.notifications];
                }
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // fetchUnreadCount
        builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
            state.unreadCount = action.payload;
        });

        // markAsRead
        builder.addCase(markAsRead.fulfilled, (state, action) => {
            const notification = state.items.find(item => item._id === action.payload);
            if (notification && !notification.isRead) {
                notification.isRead = true;
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        });

        // markAllAsRead
        builder.addCase(markAllAsRead.fulfilled, (state) => {
            state.items.forEach(item => {
                item.isRead = true;
            });
            state.unreadCount = 0;
        });
    }
});

export const { addNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
