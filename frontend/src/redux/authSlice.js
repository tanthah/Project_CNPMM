import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../api/axios'

// login thunk: posts credentials to /api/auth/login and expects { token, user }
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/auth/login', { email, password })
      const data = resp.data
      // store token in localStorage for persistence
      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      return data
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

// Forgot password: gửi OTP qua email
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/auth/forgot-password', { email })
      return resp.data
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Gửi OTP thất bại'
      return rejectWithValue(message)
    }
  }
)

// Verify OTP: xác thực OTP
export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/auth/verify-otp', { email, otp })
      return resp.data
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Xác thực OTP thất bại'
      return rejectWithValue(message)
    }
  }
)

// Reset password: đặt lại mật khẩu mới
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/auth/reset-password', { email, otp, newPassword })
      return resp.data
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại'
      return rejectWithValue(message)
    }
  }
)

const initialState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  loading: false,
  error: null,
  // Forgot password states
  otpSent: false,
  otpVerified: false,
  resetSuccess: false,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
    },
    clearForgotPasswordState(state) {
      state.otpSent = false
      state.otpVerified = false
      state.resetSuccess = false
      state.error = null
    },
  },
  extraReducers(builder) {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.token = action.payload.token
        state.user = action.payload.user || null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.otpSent = false
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false
        state.otpSent = true
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true
        state.error = null
        state.otpVerified = false
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false
        state.otpVerified = true
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.resetSuccess = false
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false
        state.resetSuccess = true
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
  },
})

export const { logout, clearForgotPasswordState } = slice.actions
export default slice.reducer
