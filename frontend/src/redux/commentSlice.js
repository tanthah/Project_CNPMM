import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import commentApi from '../api/commentApi'

export const fetchProductComments = createAsyncThunk(
  'comments/fetchProduct',
  async ({ productId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const res = await commentApi.getProductComments(productId, page, limit)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Lỗi tải bình luận')
    }
  }
)

export const createComment = createAsyncThunk(
  'comments/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await commentApi.createComment(data)
      return res.data
    } catch (err) {
      return rejectWithValue(err?.response?.data?.message || 'Lỗi tạo bình luận')
    }
  }
)

const initialState = {
  productComments: [],
  pagination: null,
  loading: false,
  submitting: false,
  error: null,
}

const slice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    clearComments: (state) => {
      state.productComments = []
      state.pagination = null
    },
    clearCommentError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductComments.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProductComments.fulfilled, (state, action) => {
        state.loading = false
        state.productComments = action.payload.comments
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProductComments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createComment.pending, (state) => {
        state.submitting = true
        state.error = null
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.submitting = false
        state.productComments.unshift(action.payload.comment)
      })
      .addCase(createComment.rejected, (state, action) => {
        state.submitting = false
        state.error = action.payload
      })
  }
})

export const { clearComments, clearCommentError } = slice.actions
export default slice.reducer

