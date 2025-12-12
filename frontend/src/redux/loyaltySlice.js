// frontend/src/redux/loyaltySlice.js - FIXED
// ========================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import loyaltyApi from '../api/loyaltyApi';

export const fetchLoyaltyPoints = createAsyncThunk(
    'loyalty/fetchPoints',
    async (_, { rejectWithValue }) => {
        try {
            const response = await loyaltyApi.getLoyaltyPoints();
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải điểm');
        }
    }
);

export const fetchPointsHistory = createAsyncThunk(
    'loyalty/fetchHistory',
    async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
        try {
            const response = await loyaltyApi.getPointsHistory(page, limit);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải lịch sử');
        }
    }
);

const loyaltyInitialState = {
    loyaltyPoints: null,
    history: [],
    pagination: null,
    loading: false,
    error: null,
};

const loyaltySlice = createSlice({
    name: 'loyalty',
    initialState: loyaltyInitialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLoyaltyPoints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLoyaltyPoints.fulfilled, (state, action) => {
                state.loading = false;
                state.loyaltyPoints = action.payload.loyaltyPoints;
            })
            .addCase(fetchLoyaltyPoints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(fetchPointsHistory.fulfilled, (state, action) => {
                state.history = action.payload.history;
                state.pagination = action.payload.pagination;
            });
    },
});

export const { clearError: clearLoyaltyError } = loyaltySlice.actions;
export default loyaltySlice.reducer;
