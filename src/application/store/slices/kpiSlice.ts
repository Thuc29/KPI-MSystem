import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { IKPIRecord, IKPITarget } from '../../../core/models';

interface KPIState {
  currentKPI: IKPIRecord | null;
  kpiList: IKPIRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: KPIState = {
  currentKPI: null,
  kpiList: [],
  loading: false,
  error: null,
};

const kpiSlice = createSlice({
  name: 'kpi',
  initialState,
  reducers: {
    setCurrentKPI: (state, action: PayloadAction<IKPIRecord | null>) => {
      state.currentKPI = action.payload;
    },
    
    setKPIList: (state, action: PayloadAction<IKPIRecord[]>) => {
      state.kpiList = action.payload;
    },
    
    addTarget: (state, action: PayloadAction<IKPITarget>) => {
      if (state.currentKPI) {
        state.currentKPI.targets.push(action.payload);
      }
    },
    
    removeTarget: (state, action: PayloadAction<string>) => {
      if (state.currentKPI) {
        state.currentKPI.targets = state.currentKPI.targets.filter(
          (target) => target.id !== action.payload
        );
      }
    },
    
    updateTarget: (state, action: PayloadAction<IKPITarget>) => {
      if (state.currentKPI) {
        const index = state.currentKPI.targets.findIndex(
          (target) => target.id === action.payload.id
        );
        if (index !== -1) {
          state.currentKPI.targets[index] = action.payload;
        }
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCurrentKPI,
  setKPIList,
  addTarget,
  removeTarget,
  updateTarget,
  setLoading,
  setError,
  clearError,
} = kpiSlice.actions;

export default kpiSlice.reducer;
