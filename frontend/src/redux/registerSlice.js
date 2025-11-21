import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axios";

// --- REGISTER API (có hỗ trợ upload ảnh) ---
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ form, imageFile }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in form) {
        formData.append(key, form[key]);
      }
      if (imageFile) formData.append("avatar", imageFile);

      const resp = await axios.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return resp.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Đăng ký thất bại");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    loading: false,
    message: "",
    error: null,
    imageFile: null,
    imagePreview: null,
  },
  reducers: {
    // ---- QUẢN LÝ ẢNH ----
    setImageFile: (state, action) => {
      state.imageFile = action.payload;

      // preview
      if (action.payload) {
        state.imagePreview = URL.createObjectURL(action.payload);
      } else {
        state.imagePreview = null;
      }
    },
    clearImage: (state) => {
      state.imageFile = null;
      state.imagePreview = null;
    },
    clearMessage: (state) => {
      state.message = "";
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = "";
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.message = "Đăng ký thành công!";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi!";
      });
  },
});

export const { setImageFile, clearImage, clearMessage } = authSlice.actions;
export default authSlice.reducer;
