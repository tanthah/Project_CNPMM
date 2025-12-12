// frontend/src/redux/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reviewApi from '../api/reviewApi';

// Create review
export const createReview = createAsyncThunk(
    'review/create',
    async (reviewData, { rejectWithValue }) => {
        try {
            const response = await reviewApi.createReview(reviewData);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tạo đánh giá');
        }
    }
);

// Get pending reviews
export const fetchPendingReviews = createAsyncThunk(
    'review/fetchPending',
    async (_, { rejectWithValue }) => {
        try {
            const response = await reviewApi.getPendingReviews();
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải danh sách');
        }
    }
);

// Get user reviews
export const fetchUserReviews = createAsyncThunk(
    'review/fetchUser',
    async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await reviewApi.getUserReviews(page, limit);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải đánh giá');
        }
    }
);

// Get product reviews
export const fetchProductReviews = createAsyncThunk(
    'review/fetchProduct',
    async ({ productId, page = 1, limit = 10, sort = 'newest' }, { rejectWithValue }) => {
        try {
            const response = await reviewApi.getProductReviews(productId, page, limit, sort);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải đánh giá');
        }
    }
);

// Update review
export const updateReview = createAsyncThunk(
    'review/update',
    async ({ reviewId, data }, { rejectWithValue }) => {
        try {
            const response = await reviewApi.updateReview(reviewId, data);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi cập nhật');
        }
    }
);

// Delete review
export const deleteReview = createAsyncThunk(
    'review/delete',
    async (reviewId, { rejectWithValue }) => {
        try {
            const response = await reviewApi.deleteReview(reviewId);
            return { reviewId, ...response.data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa');
        }
    }
);

const initialState = {
    pendingReviews: [],
    userReviews: [],
    productReviews: [],
    reviewStats: null,
    pagination: null,
    loading: false,
    submitting: false,
    error: null,
    successMessage: null,
};

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
        clearProductReviews: (state) => {
            state.productReviews = [];
            state.reviewStats = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create review
            .addCase(createReview.pending, (state) => {
                state.submitting = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.submitting = false;
                state.successMessage = action.payload.message;
                // Remove from pending if exists
                state.pendingReviews = state.pendingReviews.filter(
                    pr => !(pr.product._id === action.payload.review.productId._id && pr.orderId === action.payload.review.orderId)
                );
            })
            .addCase(createReview.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            })
            
            // Fetch pending reviews
            .addCase(fetchPendingReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPendingReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingReviews = action.payload.pendingReviews;
            })
            .addCase(fetchPendingReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch user reviews
            .addCase(fetchUserReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.userReviews = action.payload.reviews;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchUserReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch product reviews
            .addCase(fetchProductReviews.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.productReviews = action.payload.reviews;
                state.reviewStats = action.payload.stats;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProductReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Update review
            .addCase(updateReview.fulfilled, (state, action) => {
                state.successMessage = action.payload.message;
                // Update in userReviews array
                const index = state.userReviews.findIndex(
                    r => r._id === action.payload.review._id
                );
                if (index !== -1) {
                    state.userReviews[index] = action.payload.review;
                }
            })
            
            // Delete review
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.successMessage = action.payload.message;
                state.userReviews = state.userReviews.filter(
                    r => r._id !== action.payload.reviewId
                );
            });
    },
});

export const { clearError, clearSuccess, clearProductReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
