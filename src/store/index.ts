import { configureStore } from '@reduxjs/toolkit';
import kpiReducer from './slices/kpiSlice';
import authReducer from './slices/authSlice';

export const store : ReturnType<typeof configureStore> = configureStore({
  reducer: {
    kpi: kpiReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
