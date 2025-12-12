// frontend/src/redux/wishlistSlice.js - ENHANCED WITH CHECK
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import wishlistApi from '../api/wishlistApi';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.getWishlist();
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải wishlist');
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.addToWishlist(productId);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi thêm');
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.removeFromWishlist(productId);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa');
        }
    }
);

// ✅ NEW: Clear entire wishlist
export const clearWishlist = createAsyncThunk(
    'wishlist/clear',
    async (_, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.clearWishlist();
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa toàn bộ');
        }
    }
);

// ✅ NEW: Check single product
export const checkWishlist = createAsyncThunk(
    'wishlist/check',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.checkWishlist(productId);
            return { productId, ...response.data };
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi kiểm tra');
        }
    }
);

// ✅ NEW: Check multiple products
export const checkMultipleWishlist = createAsyncThunk(
    'wishlist/checkMultiple',
    async (productIds, { rejectWithValue }) => {
        try {
            const response = await wishlistApi.checkMultipleWishlist(productIds);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi kiểm tra');
        }
    }
);

const initialState = {
    wishlist: null,
    wishlistStatus: {}, // { productId: boolean }
    loading: false,
    error: null,
    successMessage: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.successMessage = null;
        },
        // Update wishlist status for a single product
        updateWishlistStatus: (state, action) => {
            const { productId, inWishlist } = action.payload;
            state.wishlistStatus[productId] = inWishlist;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload.wishlist;
                
                // Update wishlistStatus for all products in wishlist
                if (action.payload.wishlist?.products) {
                    action.payload.wishlist.products.forEach(item => {
                        if (item.productId?._id) {
                            state.wishlistStatus[item.productId._id] = true;
                        }
                    });
                }
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Add to wishlist
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload.wishlist;
                state.successMessage = action.payload.message;
                
                // Update status for the added product
                if (action.payload.wishlist?.products) {
                    action.payload.wishlist.products.forEach(item => {
                        if (item.productId?._id) {
                            state.wishlistStatus[item.productId._id] = true;
                        }
                    });
                }
            })
            
            // Remove from wishlist
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload.wishlist;
                state.successMessage = action.payload.message;
                
                // Rebuild wishlistStatus from updated wishlist
                state.wishlistStatus = {};
                if (action.payload.wishlist?.products) {
                    action.payload.wishlist.products.forEach(item => {
                        if (item.productId?._id) {
                            state.wishlistStatus[item.productId._id] = true;
                        }
                    });
                }
            })

            // ✅ Clear entire wishlist
            .addCase(clearWishlist.fulfilled, (state, action) => {
                state.wishlist = action.payload.wishlist;
                state.successMessage = action.payload.message;
                state.wishlistStatus = {};
            })
            
            // ✅ Check single product
            .addCase(checkWishlist.fulfilled, (state, action) => {
                const { productId, inWishlist } = action.payload;
                state.wishlistStatus[productId] = inWishlist;
            })
            
            // ✅ Check multiple products
            .addCase(checkMultipleWishlist.fulfilled, (state, action) => {
                state.wishlistStatus = {
                    ...state.wishlistStatus,
                    ...action.payload.wishlistStatus
                };
            });
    },
});

export const { clearError, clearSuccess, updateWishlistStatus } = wishlistSlice.actions;
export default wishlistSlice.reducer;
