import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, verifySignupOtp, sendSignupOtp, resetPassService, forgotPassService, logoutUser } from '../service/authService';

const initialState = {
  token: localStorage.getItem("token") || null,
  user: localStorage.getItem("user") || null,
  role: localStorage.getItem("role") || null,
  loading: false,
  error: null,
  isAuthenticated: false,
  otpSent: false,
};

// Async thunks
export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const data = await loginUser(credentials);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const logout = createAsyncThunk('auth/logout', async (credentials, thunkAPI) => {
  try {
    const data = await logoutUser(credentials);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const sendOtp = createAsyncThunk(
  "auth/sendOtp",
  async (userData, thunkAPI) => {
    try {
      const res = await sendSignupOtp(userData);
      return res; // "OTP sent successfully"
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (otpData, thunkAPI) => {
    try {
      const data = await verifySignupOtp(otpData);
      return data; // { token }
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const forgotPass = createAsyncThunk(
  "auth/forgotPass",
  async (resetData, thunkAPI) => {
    try {
      const data = await forgotPassService(resetData);
      return data; 
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);
export const resetPass = createAsyncThunk(
  "auth/resetPass",
  async (resetData, thunkAPI) => {
    try {
      const data = await resetPassService(resetData);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', action.payload.user);
        localStorage.setItem('role', action.payload.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.role = null
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem('user', action.payload.user);
        localStorage.setItem('role', action.payload.role);
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(forgotPass.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpSent = false;
      })
      .addCase(forgotPass.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(forgotPass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      .addCase(resetPass.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPass.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPass.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default authSlice.reducer;
