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

const initialState = {
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: null,
  loading: false,
  error: null,
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
  },
})

export const { logout } = slice.actions
export default slice.reducer
