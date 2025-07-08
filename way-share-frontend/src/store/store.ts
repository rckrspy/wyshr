import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/apiSlice';
import sessionReducer from './slices/sessionSlice';
import uiReducer from './slices/uiSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    session: sessionReducer,
    ui: uiReducer,
    report: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['report/setMedia'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.media'],
        // Ignore these paths in the state
        ignoredPaths: ['report.currentReport.media'],
      },
    }).concat(api.middleware),
});

// Enable refetch on focus/reconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;