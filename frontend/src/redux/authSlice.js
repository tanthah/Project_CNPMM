// frontend/src/redux/authSlice.js - LOGOUT FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from '../api/axios'

// Helper functions for localStorage
const loadUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (err) {
    console.error('Error loading user from storage:', err)
    return null
  }
}

const saveUserToStorage = (user) => {
  try {
    localStorage.setItem('user', JSON.stringify(user))
  } catch (err) {
    console.error('Error saving user to storage:', err)
  }
}

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    console.log('✅ User data cleared from localStorage')
  } catch (err) {
    console.error('Error removing user from storage:', err)
  }
}

// Login thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const resp = await axios.post('/auth/login', { email, password })
      const data = resp.data

      if (data.token) {
        localStorage.setItem('token', data.token)
      }
      if (data.user) {
        saveUserToStorage(data.user)
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

// Verify OTP
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

// Reset password
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

// ✅ Logout thunk - calls backend API to blacklist token
export const logoutAsync = createAsyncThunk(
  'auth/logoutAsync',
  async (_, { rejectWithValue }) => {
    // Check if token exists before calling API to prevent 400 Bad Request
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('ℹ️ No token found, skipping backend logout');
      return { success: true };
    }

    try {
      console.log('🚪 Calling logout API with token:', token.substring(0, 10) + '...')
      await axios.post('/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      console.log('✅ Token added to blacklist')
      return { success: true }
    } catch (err) {
      console.log('⚠️ Logout API error (continuing anyway):', err.message)
      // Even if API fails, we still want to logout locally
      return { success: true }
    }
  }
)

const initialState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: typeof window !== 'undefined' ? loadUserFromStorage() : null,
  loading: false,
  error: null,
  otpSent: false,
  otpVerified: false,
  resetSuccess: false,
}

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      console.log('🚪 Logging out user...')
      state.token = null
      state.user = null
      state.error = null
      state.otpSent = false
      state.otpVerified = false
      state.resetSuccess = false
      removeUserFromStorage()
    },
    clearForgotPasswordState(state) {
      state.otpSent = false
      state.otpVerified = false
      state.resetSuccess = false
      state.error = null
    },
    updateUser(state, action) {
      state.user = { ...state.user, ...action.payload }
      saveUserToStorage(state.user)
    },
    // Google OAuth - set credentials manually
    setCredentials(state, action) {
      const { token, user } = action.payload
      state.token = token
      state.user = user
      state.loading = false
      state.error = null
      if (token) {
        localStorage.setItem('token', token)
      }
      if (user) {
        saveUserToStorage(user)
      }
    },
  },
  extraReducers(builder) {
    builder
      // Login
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
      // ✅ Logout Async Handler
      .addCase(logoutAsync.fulfilled, (state) => {
        console.log('🚪 Logout fulfilled - clearing state')
        state.token = null
        state.user = null
        state.error = null
        state.otpSent = false
        state.otpVerified = false
        state.resetSuccess = false
        state.loading = false
        removeUserFromStorage()
      })
  },
})

export const { logout, clearForgotPasswordState, updateUser, setCredentials } = slice.actions
export default slice.reducer