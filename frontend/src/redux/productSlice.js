import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productApi from "../api/productApi";

/* -----------------------------------------------------
    FETCH THUNKS ( chạy song song )
----------------------------------------------------- */
export const fetchLatestProducts = createAsyncThunk(
  "products/fetchLatest",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getNewest();
      return res.data.products;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Lỗi tải sản phẩm mới");
    }
  }
);

export const fetchBestSellers = createAsyncThunk(
  "products/fetchBestSellers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getBestSelling();
      return res.data.products;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Lỗi tải sản phẩm bán chạy");
    }
  }
);

export const fetchMostViewed = createAsyncThunk(
  "products/fetchMostViewed",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getMostViewed();
      return res.data.products;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Lỗi tải sản phẩm xem nhiều");
    }
  }
);

export const fetchTopDiscounts = createAsyncThunk(
  "products/fetchTopDiscounts",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productApi.getHighestDiscount();
      return res.data.products;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Lỗi tải sản phẩm khuyến mãi");
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await productApi.getDetail(id);
      return res.data.product;
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || "Lỗi tải chi tiết sản phẩm");
    }
  }
);

/* -----------------------------------------------------
    INITIAL STATE — loading tách riêng
----------------------------------------------------- */

const initialState = {
  latest: [],
  bestSellers: [],
  mostViewed: [],
  topDiscounts: [],
  currentProduct: null,

  // loading tách riêng giúp tránh re-render thừa
  loadingLatest: false,
  loadingBestSellers: false,
  loadingMostViewed: false,
  loadingTopDiscounts: false,
  loadingProduct: false,

  // error riêng
  errorLatest: null,
  errorBestSellers: null,
  errorMostViewed: null,
  errorTopDiscounts: null,
  errorProduct: null,
};

/* -----------------------------------------------------
    SLICE
----------------------------------------------------- */
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.errorProduct = null;
    },
    clearAllErrors: (state) => {
      state.errorLatest =
        state.errorBestSellers =
        state.errorMostViewed =
        state.errorTopDiscounts =
        state.errorProduct =
          null;
    },
  },

  extraReducers: (builder) => {
    /* ------------------------------
        Latest
    ------------------------------ */
    builder
      .addCase(fetchLatestProducts.pending, (state) => {
        state.loadingLatest = true;
        state.errorLatest = null;
      })
      .addCase(fetchLatestProducts.fulfilled, (state, action) => {
        state.loadingLatest = false;
        state.latest = action.payload;
      })
      .addCase(fetchLatestProducts.rejected, (state, action) => {
        state.loadingLatest = false;
        state.errorLatest = action.payload;
      });

    /* ------------------------------
        Best Sellers
    ------------------------------ */
    builder
      .addCase(fetchBestSellers.pending, (state) => {
        state.loadingBestSellers = true;
        state.errorBestSellers = null;
      })
      .addCase(fetchBestSellers.fulfilled, (state, action) => {
        state.loadingBestSellers = false;
        state.bestSellers = action.payload;
      })
      .addCase(fetchBestSellers.rejected, (state, action) => {
        state.loadingBestSellers = false;
        state.errorBestSellers = action.payload;
      });

    /* ------------------------------
        Most Viewed
    ------------------------------ */
    builder
      .addCase(fetchMostViewed.pending, (state) => {
        state.loadingMostViewed = true;
        state.errorMostViewed = null;
      })
      .addCase(fetchMostViewed.fulfilled, (state, action) => {
        state.loadingMostViewed = false;
        state.mostViewed = action.payload;
      })
      .addCase(fetchMostViewed.rejected, (state, action) => {
        state.loadingMostViewed = false;
        state.errorMostViewed = action.payload;
      });

    /* ------------------------------
        Top Discounts
    ------------------------------ */
    builder
      .addCase(fetchTopDiscounts.pending, (state) => {
        state.loadingTopDiscounts = true;
        state.errorTopDiscounts = null;
      })
      .addCase(fetchTopDiscounts.fulfilled, (state, action) => {
        state.loadingTopDiscounts = false;
        state.topDiscounts = action.payload;
      })
      .addCase(fetchTopDiscounts.rejected, (state, action) => {
        state.loadingTopDiscounts = false;
        state.errorTopDiscounts = action.payload;
      });

    /* ------------------------------
        Product Detail
    ------------------------------ */
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loadingProduct = true;
        state.errorProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingProduct = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingProduct = false;
        state.errorProduct = action.payload;
      });
  },
});

export const { clearCurrentProduct, clearAllErrors } = productSlice.actions;
export default productSlice.reducer;
