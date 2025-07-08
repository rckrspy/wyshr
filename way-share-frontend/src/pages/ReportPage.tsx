import React, { useEffect } from 'react';
import { Box, Container, Paper, Stepper, Step, StepLabel } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { startNewReport } from '../store/slices/reportSlice';
import { requiresLicensePlate } from '../utils/incidentTypeHelpers';
import IncidentTypeStep from '../features/report/IncidentTypeStep';
import CaptureStep from '../features/report/CaptureStep';
import DetailsStep from '../features/report/DetailsStep';
import ReviewStep from '../features/report/ReviewStep';
import SuccessStep from '../features/report/SuccessStep';

const steps = ['Incident Type', 'Capture', 'Details', 'Review'];

const ReportPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentReport, step } = useAppSelector((state) => state.report);

  useEffect(() => {
    // Start a new report when the page loads
    if (!currentReport) {
      dispatch(startNewReport());
    }
  }, [dispatch, currentReport]);

  const getStepIndex = () => {
    switch (step) {
      case 'incidentType':
        return 0;
      case 'capture':
        return 1;
      case 'details':
        return 2;
      case 'review':
        return 3;
      case 'success':
        return 4;
      default:
        return 0;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'incidentType':
        return <IncidentTypeStep />;
      case 'capture':
        return <CaptureStep />;
      case 'details':
        return <DetailsStep />;
      case 'review':
        return <ReviewStep />;
      case 'success':
        return <SuccessStep />;
      default:
        return <IncidentTypeStep />;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        {step !== 'success' && (
          <Stepper activeStep={getStepIndex()} sx={{ mb: 4 }}>
            {steps.map((label, index) => {
              // Skip the 'Capture' step for location-based incidents
              const shouldSkip = index === 1 && step === 'details' && 
                currentReport?.incidentType && 
                !requiresLicensePlate(currentReport.incidentType);
              
              return (
                <Step key={label} completed={shouldSkip ? true : undefined}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        )}
        <Box>{renderStep()}</Box>
      </Paper>
    </Container>
  );
};

export default ReportPage;