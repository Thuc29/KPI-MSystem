import { TypedUseSelectorHook, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../store';

export const useAppDispatch : TypedUseSelectorHook<RootState> = () => useDispatch<AppDispatch>();
