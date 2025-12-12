// frontend/src/redux/categorySlice.js - FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryApi from '../api/categoryApi';

// Fetch all categories
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await categoryApi.getAll();
            return response.data.categories;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải danh mục');
        }
    }
);

// Fetch products by category with pagination
export const fetchProductsByCategory = createAsyncThunk(
    'categories/fetchProducts',
    async ({ categoryId, page = 1, limit = 12 }, { rejectWithValue }) => {
        try {
            const response = await categoryApi.getProducts(categoryId, page, limit);
            return response.data;
        } catch (err) {
            return rejectWithValue(err?.response?.data?.message || 'Lỗi khi tải sản phẩm');
        }
    }
);

const initialState = {
    categories: [],
    currentCategory: null,
    categoryProducts: [],
    pagination: null,
    loading: false,
    error: null,
};

const categorySlice = createSlice({
    name: 'categories', // Giữ nguyên 'categories'
    initialState,
    reducers: {
        clearCategoryProducts: (state) => {
            state.categoryProducts = [];
            state.currentCategory = null;
            state.pagination = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.categories = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            
            // Fetch products by category
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.currentCategory = action.payload.category;
                state.categoryProducts = action.payload.products;
                state.pagination = action.payload.pagination;
            })
            .addCase(fetchProductsByCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCategoryProducts, clearError } = categorySlice.actions;
export default categorySlice.reducer;