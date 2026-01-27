// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import areaReducer from "./slice/areaSlice";
import shopReducer from "./slice/shopSlice";
import orderReducer from "./slice/orderSlice";
import userReducer from "./slice/userSlice";
import cityReducer from "./slice/citySlice";
import distributorOrderReducer from "./slice/distributorOrderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    area: areaReducer,
    shop: shopReducer,
    order: orderReducer,
    user: userReducer,
    city: cityReducer,
    distributorOrder: distributorOrderReducer,
  },
});
