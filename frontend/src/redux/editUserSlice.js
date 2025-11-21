import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../api/axios';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải thông tin người dùng');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.put('/user/profile', userData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/user/upload-avatar', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải lên ảnh đại diện');
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  updating: false,
  uploadingAvatar: false,
  error: null,
  success: false,
  successMessage: ''
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.success = false;
      state.successMessage = '';
    },
    updateUserField: (state, action) => {
      const { field, value } = action.payload;
      if (state.user) {
        state.user[field] = value;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.user = action.payload.data;
        state.success = true;
        state.successMessage = 'Cập nhật thông tin thành công!';
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.uploadingAvatar = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.uploadingAvatar = false;
        if (state.user) {
          state.user.avatar = action.payload.avatar;
        }
        state.success = true;
        state.successMessage = 'Cập nhật ảnh đại diện thành công!';
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.uploadingAvatar = false;
        state.error = action.payload;
      });
  }
});

export const { clearMessages, updateUserField } = userSlice.actions;
export default userSlice.reducer;