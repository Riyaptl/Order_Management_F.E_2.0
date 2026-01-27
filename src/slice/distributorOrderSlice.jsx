import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteOrderService, getOrdersService, statusOrderService, placeOrder, SrPerformance, getOrdersSRService, getOrdersDateService } from "../service/distributorOrderService";

// Async thunk
export const createOrder = createAsyncThunk(
  "distributorOrder/create",
  async (orderData, thunkAPI) => {
    try {
      return await placeOrder(orderData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  "distributorOrder/getOrders",
  async (data, thunkAPI) => {
    try {
      return await getOrdersService(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "distributorOrder/deleteOrder",
  async (id, thunkAPI) => {
    try {
            
      return await deleteOrderService(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const statusOrder = createAsyncThunk(
  "distributorOrder/statusOrder",
  async (data, thunkAPI) => {
    try {      
      console.log(data);
      
      return await statusOrderService(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);


const distributorOrderSlice = createSlice({
  name: "distributorOrder",
  initialState: {
    distributorOrders: [],
    loading: false,
    success: false,
    error: null,
  },
  reducers: {
    resetOrderState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.distributorOrders = action.payload.orders;       
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
       .addCase(statusOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(statusOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null     
      })
      .addCase(statusOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteOrder.fulfilled, (state) => {
        state.loading = false;
        state.error = null     
      })
      .addCase(deleteOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
     
      
  },
});

export const { resetOrderState } = distributorOrderSlice.actions;

export default distributorOrderSlice.reducer;
