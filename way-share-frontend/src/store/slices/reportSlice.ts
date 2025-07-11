import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Report, IncidentType } from '../../types';

interface ReportState {
  currentReport: Partial<Report> | null;
  step: 'incidentType' | 'capture' | 'details' | 'review' | 'success';
  selectedCategory?: 'vehicle' | 'location' | null;
}

const initialState: ReportState = {
  currentReport: null,
  step: 'incidentType',
  selectedCategory: undefined,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    startNewReport: (state) => {
      state.currentReport = {
        licensePlate: undefined,
        incidentType: undefined,
        subcategory: undefined,
        location: undefined,
        description: '',
        media: null,
      };
      state.step = 'incidentType';
      state.selectedCategory = undefined;
    },
    setLicensePlate: (state, action: PayloadAction<string>) => {
      if (state.currentReport) {
        state.currentReport.licensePlate = action.payload;
      }
    },
    setIncidentType: (state, action: PayloadAction<IncidentType>) => {
      if (state.currentReport) {
        state.currentReport.incidentType = action.payload;
      }
    },
    setSubcategory: (state, action: PayloadAction<string | undefined>) => {
      if (state.currentReport) {
        state.currentReport.subcategory = action.payload;
      }
    },
    setSelectedCategory: (state, action: PayloadAction<'vehicle' | 'location' | null | undefined>) => {
      state.selectedCategory = action.payload;
    },
    setLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      if (state.currentReport) {
        state.currentReport.location = action.payload;
      }
    },
    setDescription: (state, action: PayloadAction<string>) => {
      if (state.currentReport) {
        state.currentReport.description = action.payload;
      }
    },
    setMedia: (state, action: PayloadAction<File | null>) => {
      if (state.currentReport) {
        state.currentReport.media = action.payload;
      }
    },
    setStep: (state, action: PayloadAction<ReportState['step']>) => {
      state.step = action.payload;
    },
    clearReport: (state) => {
      state.currentReport = null;
      state.step = 'incidentType';
      state.selectedCategory = undefined;
    },
  },
});

export const {
  startNewReport,
  setLicensePlate,
  setIncidentType,
  setSubcategory,
  setSelectedCategory,
  setLocation,
  setDescription,
  setMedia,
  setStep,
  clearReport,
} = reportSlice.actions;

export default reportSlice.reducer;