import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axios";

// Send OTP for registration
export const sendRegisterOtp = createAsyncThunk(
  "register/sendOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const resp = await axios.post("/auth/send-register-otp", { email });
      return resp.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Gửi OTP thất bại");
    }
  }
);

// Verify OTP
export const verifyRegisterOtp = createAsyncThunk(
  "register/verifyOtp",
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const resp = await axios.post("/auth/verify-register-otp", { email, otp });
      return resp.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Xác thực OTP thất bại");
    }
  }
);

// Complete registration
export const completeRegistration = createAsyncThunk(
  "register/complete",
  async (formData, { rejectWithValue }) => {
    try {
      const resp = await axios.post("/auth/complete-register", formData);
      
      // Save token to localStorage
      if (resp.data.token) {
        localStorage.setItem('token', resp.data.token);
      }
      
      return resp.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Đăng ký thất bại");
    }
  }
);

const registerSlice = createSlice({
  name: "register",
  initialState: {
    loading: false,
    message: "",
    error: null,
    imageFile: null,
    imagePreview: null,
    otpSent: false,
    otpVerified: false,
    registrationComplete: false,
    step: 1, // 1: form, 2: otp, 3: success
  },
  reducers: {
    setImageFile: (state, action) => {
      state.imageFile = action.payload;
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
    resetRegisterState: (state) => {
      state.loading = false;
      state.message = "";
      state.error = null;
      state.otpSent = false;
      state.otpVerified = false;
      state.registrationComplete = false;
      state.step = 1;
    },
    setStep: (state, action) => {
      state.step = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(sendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
        state.step = 2;
        state.message = "Mã OTP đã được gửi đến email của bạn";
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpVerified = true;
        state.message = "Xác thực OTP thành công";
      })
      .addCase(verifyRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Registration
      .addCase(completeRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationComplete = true;
        state.step = 3;
        state.message = action.payload.message;
      })
      .addCase(completeRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setImageFile, 
  clearImage, 
  clearMessage, 
  resetRegisterState,
  setStep 
} = registerSlice.actions;

export default registerSlice.reducer;