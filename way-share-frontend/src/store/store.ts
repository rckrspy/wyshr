import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/apiSlice';
import { authApi } from './api/authApiSlice';
import { identityApi } from './api/identityApiSlice';
import { vehicleApi } from './api/vehicleApiSlice';
import { incidentApi } from './api/incidentApiSlice';
import { driverScoreApi } from './api/driverScoreApiSlice';
import { rewardsApiSlice } from './api/rewardsApiSlice';
import sessionReducer from './slices/sessionSlice';
import uiReducer from './slices/uiSlice';
import reportReducer from './slices/reportSlice';
import authReducer from './slices/authSlice';

export const rootReducer = {
  [api.reducerPath]: api.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [identityApi.reducerPath]: identityApi.reducer,
  [vehicleApi.reducerPath]: vehicleApi.reducer,
  [incidentApi.reducerPath]: incidentApi.reducer,
  [driverScoreApi.reducerPath]: driverScoreApi.reducer,
  [rewardsApiSlice.reducerPath]: rewardsApiSlice.reducer,
  session: sessionReducer,
  ui: uiReducer,
  report: reportReducer,
  auth: authReducer,
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['report/setMedia'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.media', 'meta.arg', 'meta.baseQueryMeta'],
        // Ignore these paths in the state
        ignoredPaths: ['report.currentReport.media'],
      },
    }).concat(api.middleware, authApi.middleware, identityApi.middleware, vehicleApi.middleware, incidentApi.middleware, driverScoreApi.middleware, rewardsApiSlice.middleware),
});

// Enable refetch on focus/reconnect
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;