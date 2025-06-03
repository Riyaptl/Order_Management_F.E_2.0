import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchDistDetails, fetchSRDetails, singleSRService } from "../service/userService";

export const singleSRDetails = createAsyncThunk(
  "user/singleSRDetails",
  async (data, thunkAPI) => {
    try {
      return await singleSRService(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getSRDetails = createAsyncThunk(
  "user/getDetails",
  async (thunkAPI) => {
    try {
      return await fetchSRDetails();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getDistDetails = createAsyncThunk(
  "user/getDistDetails",
  async (thunkAPI) => {
    try {
      return await fetchDistDetails();
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


const userSlice = createSlice({
  name: "user",
  initialState: {
    srs: [],
    dists: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getSRDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSRDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.srs = action.payload;
      })
      .addCase(getSRDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getDistDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDistDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.dists = action.payload;
      })
      .addCase(getDistDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      }); 
  },
});

export default userSlice.reducer;
