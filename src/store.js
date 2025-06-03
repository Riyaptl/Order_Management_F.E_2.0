// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import areaReducer from "./slice/areaSlice";
import shopReducer from "./slice/shopSlice";
import orderReducer from "./slice/orderSlice";
import userReducer from "./slice/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    area: areaReducer,
    shop: shopReducer,
    order: orderReducer,
    user: userReducer,
  },
});
