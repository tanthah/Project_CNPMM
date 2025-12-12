// frontend/src/redux/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import cartApi from '../api/cartApi'

// Fetch cart
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartApi.getCart()
            return response.data.cart
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải giỏ hàng')
        }
    }
)

// Add to cart
export const addToCart = createAsyncThunk(
    'cart/addToCart',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartApi.addToCart(productId, quantity)
            return response.data.cart
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi thêm vào giỏ hàng')
        }
    }
)

// Update cart item
export const updateCartItem = createAsyncThunk(
    'cart/updateCartItem',
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            const response = await cartApi.updateCartItem(productId, quantity)
            return response.data.cart
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi cập nhật giỏ hàng')
        }
    }
)

// Remove from cart
export const removeFromCart = createAsyncThunk(
    'cart/removeFromCart',
    async (productId, { rejectWithValue }) => {
        try {
            const response = await cartApi.removeFromCart(productId)
            return response.data.cart
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa sản phẩm')
        }
    }
)

// Clear cart
export const clearCart = createAsyncThunk(
    'cart/clearCart',
    async (_, { rejectWithValue }) => {
        try {
            const response = await cartApi.clearCart()
            return response.data.cart
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi xóa giỏ hàng')
        }
    }
)

const initialState = {
    cart: null,
    loading: false,
    updating: false,
    error: null,
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch cart
            .addCase(fetchCart.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false
                state.cart = action.payload
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            
            // Add to cart
            .addCase(addToCart.pending, (state) => {
                state.updating = true
                state.error = null
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.updating = false
                state.cart = action.payload
            })
            .addCase(addToCart.rejected, (state, action) => {
                state.updating = false
                state.error = action.payload
            })
            
            // Update cart item
            .addCase(updateCartItem.pending, (state) => {
                state.updating = true
                state.error = null
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.updating = false
                state.cart = action.payload
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.updating = false
                state.error = action.payload
            })
            
            // Remove from cart
            .addCase(removeFromCart.pending, (state) => {
                state.updating = true
                state.error = null
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.updating = false
                state.cart = action.payload
            })
            .addCase(removeFromCart.rejected, (state, action) => {
                state.updating = false
                state.error = action.payload
            })
            
            // Clear cart
            .addCase(clearCart.pending, (state) => {
                state.updating = true
                state.error = null
            })
            .addCase(clearCart.fulfilled, (state, action) => {
                state.updating = false
                state.cart = action.payload
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.updating = false
                state.error = action.payload
            })
    },
})

export const { clearError } = cartSlice.actions
export default cartSlice.reducer