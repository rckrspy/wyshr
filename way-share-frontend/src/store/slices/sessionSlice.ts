import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SessionState, Report } from '../../types';

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const initialState: SessionState = {
  sessionId: localStorage.getItem('wayshare_session_id') || generateSessionId(),
  isOnline: navigator.onLine,
  pendingReports: JSON.parse(localStorage.getItem('wayshare_pending_reports') || '[]'),
};

// Save session ID to localStorage
if (!localStorage.getItem('wayshare_session_id')) {
  localStorage.setItem('wayshare_session_id', initialState.sessionId!);
}

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    addPendingReport: (state, action: PayloadAction<Report>) => {
      state.pendingReports.push(action.payload);
      localStorage.setItem('wayshare_pending_reports', JSON.stringify(state.pendingReports));
    },
    removePendingReport: (state, action: PayloadAction<string>) => {
      state.pendingReports = state.pendingReports.filter(
        (report) => report.id !== action.payload
      );
      localStorage.setItem('wayshare_pending_reports', JSON.stringify(state.pendingReports));
    },
    clearPendingReports: (state) => {
      state.pendingReports = [];
      localStorage.removeItem('wayshare_pending_reports');
    },
    resetSession: (state) => {
      const newSessionId = generateSessionId();
      state.sessionId = newSessionId;
      state.pendingReports = [];
      localStorage.setItem('wayshare_session_id', newSessionId);
      localStorage.removeItem('wayshare_pending_reports');
    },
  },
});

export const {
  setOnlineStatus,
  addPendingReport,
  removePendingReport,
  clearPendingReports,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;