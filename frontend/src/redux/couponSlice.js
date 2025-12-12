// frontend/src/redux/couponSlice.js - FIXED
// ========================================
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import couponApi from '../api/couponApi';

export const fetchUserCoupons = createAsyncThunk(
    'coupon/fetchUser',
    async (status = 'active', { rejectWithValue }) => {
        try {
            const response = await couponApi.getUserCoupons(status);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải mã giảm giá');
        }
    }
);

export const validateCoupon = createAsyncThunk(
    'coupon/validate',
    async ({ code, orderValue }, { rejectWithValue }) => {
        try {
            const response = await couponApi.validateCoupon(code, orderValue);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Mã giảm giá không hợp lệ');
        }
    }
);

const couponInitialState = {
    coupons: [],
    validatedCoupon: null,
    loading: false,
    validating: false,
    error: null,
};

const couponSlice = createSlice({
    name: 'coupon',
    initialState: couponInitialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearValidatedCoupon: (state) => {
            state.validatedCoupon = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserCoupons.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserCoupons.fulfilled, (state, action) => {
                state.loading = false;
                state.coupons = action.payload.coupons;
            })
            .addCase(fetchUserCoupons.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            .addCase(validateCoupon.pending, (state) => {
                state.validating = true;
                state.error = null;
            })
            .addCase(validateCoupon.fulfilled, (state, action) => {
                state.validating = false;
                state.validatedCoupon = action.payload.coupon;
            })
            .addCase(validateCoupon.rejected, (state, action) => {
                state.validating = false;
                state.error = action.payload;
            });
    },
});

export const { clearError: clearCouponError, clearValidatedCoupon } = couponSlice.actions;
export default couponSlice.reducer;