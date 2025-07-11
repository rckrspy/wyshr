import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  NavigateBefore as BackIcon,
  Send as SendIcon,
  DirectionsCar as CarIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setStep } from '../../store/slices/reportSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { addPendingReport } from '../../store/slices/sessionSlice';
import { useSubmitReportMutation } from '../../store/api/apiSlice';
import { IncidentType } from '../../types';
import { getIncidentTypeDisplayName } from '../../utils/incidentTypeHelpers';

// Removed - using getIncidentTypeDisplayName instead

const ReviewStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const report = useAppSelector((state) => state.report.currentReport);
  const sessionId = useAppSelector((state) => state.session.sessionId);
  const isOnline = useAppSelector((state) => state.session.isOnline);
  const [submitReport] = useSubmitReportMutation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    dispatch(setStep('details'));
  };

  const handleSubmit = async () => {
    if (!report || !sessionId) return;

    setIsSubmitting(true);

    try {
      // Create form data for submission
      const formData = new FormData();
      if (report.licensePlate) {
        formData.append('licensePlate', report.licensePlate);
      }
      formData.append('incidentType', report.incidentType || '');
      if (report.subcategory) {
        formData.append('subcategory', report.subcategory);
      }
      formData.append('location[lat]', report.location?.lat.toString() || '');
      formData.append('location[lng]', report.location?.lng.toString() || '');
      if (report.description) {
        formData.append('description', report.description);
      }
      if (report.media) {
        formData.append('media', report.media);
      }

      if (isOnline) {
        // Submit immediately if online
        await submitReport(formData).unwrap();
        dispatch(
          showNotification({
            type: 'success',
            message: 'Report submitted successfully!',
          })
        );
        dispatch(setStep('success'));
      } else {
        // Queue for later if offline
        const pendingReport = {
          ...report,
          licensePlate: report.licensePlate,
          incidentType: report.incidentType!,
          location: report.location!,
          id: `pending_${Date.now()}`,
          sessionId,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        };
        dispatch(addPendingReport(pendingReport));
        dispatch(
          showNotification({
            type: 'info',
            message: 'Report saved. Will be submitted when you\'re back online.',
          })
        );
        dispatch(setStep('success'));
      }
    } catch (error) {
      console.error('Submit error:', error);
      dispatch(
        showNotification({
          type: 'error',
          message: 'Failed to submit report. Please try again.',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!report) {
    return <Alert severity="error">No report data found</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review Your Report
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Please review the details before submitting. All information will be anonymized.
      </Typography>

      <Stack spacing={3}>
        {/* Report Summary */}
        <Card>
          <CardContent>
            <List>
              {report.licensePlate && (
                <ListItem>
                  <ListItemIcon>
                    <CarIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="License Plate"
                    secondary={`${report.licensePlate} (will be anonymized)`}
                  />
                </ListItem>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <WarningIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Incident Type"
                  secondary={getIncidentTypeDisplayName(report.incidentType as IncidentType)}
                />
              </ListItem>
              
              {report.subcategory && (
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Specific Issue"
                    secondary={report.subcategory}
                  />
                </ListItem>
              )}
              
              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Location"
                  secondary="Current location (will be rounded to 100m)"
                />
              </ListItem>
              
              {report.description && (
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Description"
                    secondary={report.description}
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        {/* Privacy Notice */}
        <Alert severity="info" icon={<SecurityIcon />}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Privacy Protection Active
          </Typography>
          <Typography variant="body2">
            {report.licensePlate && (
              <>
                • License plate will be irreversibly hashed
                <br />
              </>
            )}
            • Location will be rounded to nearest 100m
            <br />
            • No personal information is collected
            <br />
            • Report is completely anonymous
          </Typography>
        </Alert>

        {/* Offline Notice */}
        {!isOnline && (
          <Alert severity="warning">
            You're currently offline. Your report will be saved and automatically
            submitted when you reconnect to the internet.
          </Alert>
        )}

        {/* Navigation Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleBack}
              disabled={isSubmitting}
              fullWidth
            >
              Back
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              startIcon={
                isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />
              }
              onClick={handleSubmit}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default ReviewStep;