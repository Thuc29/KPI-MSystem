import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ITaskItem } from '../../../core/models';

interface TaskState {
  tasks: ITaskItem[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ITaskItem[]>) => {
      state.tasks = action.payload;
    },
    
    addTask: (state, action: PayloadAction<ITaskItem>) => {
      state.tasks.push(action.payload);
    },
    
    updateTask: (state, action: PayloadAction<ITaskItem>) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    },
    
    markTaskComplete: (state, action: PayloadAction<{ taskId: string; evidence: any }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = 'pending_verify';
        task.completedAt = new Date().toISOString();
        task.evidenceMessage = action.payload.evidence.message;
        task.evidenceFiles = action.payload.evidence.files;
      }
    },
    
    verifyTask: (state, action: PayloadAction<{ taskId: string; verifiedBy: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = 'verified';
        task.verifiedAt = new Date().toISOString();
        task.verifiedBy = action.payload.verifiedBy;
      }
    },
    
    rejectTask: (state, action: PayloadAction<{ taskId: string; rejectedBy: string; reason: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.status = 'to_do';
        task.rejectedAt = new Date().toISOString();
        task.rejectedBy = action.payload.rejectedBy;
        task.rejectionReason = action.payload.reason;
        task.completedAt = undefined;
        task.evidenceMessage = undefined;
        task.evidenceFiles = undefined;
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setTasks,
  addTask,
  updateTask,
  removeTask,
  markTaskComplete,
  verifyTask,
  rejectTask,
  setLoading,
  setError,
} = taskSlice.actions;

export default taskSlice.reducer;
