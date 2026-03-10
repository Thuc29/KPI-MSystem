import { configureStore } from '@reduxjs/toolkit';
import kpiReducer from './slices/kpiSlice';
import authReducer from './slices/authSlice';
import taskReducer from './slices/taskSlice';

export const store : ReturnType<typeof configureStore> = configureStore({
  reducer: {
    kpi: kpiReducer,
    auth: authReducer,
    task: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
