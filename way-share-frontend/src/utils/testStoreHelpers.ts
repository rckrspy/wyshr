import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../store/store';

// Mock Redux store for testing
export const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};