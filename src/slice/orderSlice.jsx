import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deleteOrderService, exportOrdersCsvService, getOrdersService, placeOrder, SrPerformance } from "../service/orderService";

// Async thunk
export const SrReport = createAsyncThunk(
  "order/report",
  async (data, thunkAPI) => {
    try {
      return await SrPerformance(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const createOrder = createAsyncThunk(
  "order/create",
  async (orderData, thunkAPI) => {
    try {
        console.log(orderData);
      return await placeOrder(orderData);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const getOrders = createAsyncThunk(
  "order/getOrders",
  async (data, thunkAPI) => {
    try {
      console.log(data);
      return await getOrdersService(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (id, thunkAPI) => {
    try {
      return await deleteOrderService(id);
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const exportOrdersCsv = createAsyncThunk(
  "orders/exportCsv",
  async (exportParams, thunkAPI) => {
    try {
      const data = await exportOrdersCsvService(exportParams);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState: {
    orders: [],
    summary: [],
    loading: false,
    success: false,
    error: null,
    exportLoading: false,
    exportError: null,
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
    .addCase(SrReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SrReport.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.totalSummary;    
           
      })
      .addCase(SrReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
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
        state.orders = action.payload.orders;       
      })
      .addCase(getOrders.rejected, (state, action) => {
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
      .addCase(exportOrdersCsv.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportOrdersCsv.fulfilled, (state) => {
        state.exportLoading = false;
        state.exportError = null;
      })
      .addCase(exportOrdersCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload ;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;

export default orderSlice.reducer;
