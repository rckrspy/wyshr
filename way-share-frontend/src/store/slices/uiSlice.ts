import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState } from '../../types';

const initialState: UIState = {
  isLoading: false,
  error: null,
  notification: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
      }>
    ) => {
      state.notification = action.payload;
    },
    hideNotification: (state) => {
      state.notification = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  showNotification,
  hideNotification,
  clearError,
} = uiSlice.actions;

export default uiSlice.reducer;