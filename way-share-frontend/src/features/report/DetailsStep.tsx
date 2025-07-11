import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  setLocation,
  setDescription,
  setSubcategory,
  setStep,
} from '../../store/slices/reportSlice';
import { showNotification } from '../../store/slices/uiSlice';
// import { IncidentType } from '../../types';
import { getIncidentTypeDisplayName } from '../../utils/incidentTypeHelpers';
import { SubcategorySelector } from './SubcategorySelector';

// Development logging flag
const isLoggingEnabled = process.env.NODE_ENV === 'development';

// Note: getSubcategories moved to SubcategorySelector component

// Note: incidentTypeInfo was removed as it was unused

const DetailsStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const report = useAppSelector((state) => state.report.currentReport);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  const getCurrentLocation = useCallback(() => {
    setLocationStatus('loading');
    
    if (!navigator.geolocation) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Geolocation is not supported by this browser',
        })
      );
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Round coordinates to protect privacy (100m precision)
        const roundedLat = Math.round(latitude * 1000) / 1000;
        const roundedLng = Math.round(longitude * 1000) / 1000;
        
        if (isLoggingEnabled) {
          console.log('Location obtained:', {
            lat: roundedLat,
            lng: roundedLng,
            accuracy: position.coords.accuracy,
          });
        }

        dispatch(setLocation({ lat: latitude, lng: longitude }));
        setLocationStatus('success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        dispatch(
          showNotification({
            type: 'error',
            message: 'Unable to get your location. Please ensure location access is enabled.',
          })
        );
        setLocationStatus('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [dispatch]);

  useEffect(() => {
    // Get current location on mount
    if (!report?.location && locationStatus === 'idle') {
      getCurrentLocation();
    }
  }, [report?.location, locationStatus, getCurrentLocation]);

  const handleNext = () => {
    if (!report?.incidentType) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Please select an incident type',
        })
      );
      return;
    }

    if (!report?.location) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Please ensure location access is enabled',
        })
      );
      return;
    }

    dispatch(setStep('review'));
  };

  const handleBack = () => {
    dispatch(setStep('incidentType'));
  };

  if (!report) {
    return <Alert severity="error">No report data found</Alert>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Report Details
          </Typography>
          
          <Stack spacing={3}>
            {/* Incident Type Display */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Selected Incident Type
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {report.incidentType ? getIncidentTypeDisplayName(report.incidentType) : 'None selected'}
              </Typography>
            </Box>

            {/* Subcategory Selection */}
            {report.incidentType && (
              <Box>
                <SubcategorySelector
                  subcategories={[]} // TODO: Get subcategories for the incident type
                  value={report.subcategory}
                  onChange={(subcategory: string) => {
                    dispatch(setSubcategory(subcategory));
                  }}
                />
              </Box>
            )}

            {/* Location Status */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  {locationStatus === 'loading' && <CircularProgress size={20} />}
                  {locationStatus === 'success' && (
                    <CheckCircle color="success" />
                  )}
                  {locationStatus === 'error' && (
                    <Error color="error" />
                  )}
                  <Typography variant="body2">
                    {locationStatus === 'loading' && 'Getting location...'}
                    {locationStatus === 'success' && 'Location obtained'}
                    {locationStatus === 'error' && 'Location unavailable'}
                    {locationStatus === 'idle' && 'Location not requested'}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === 'loading'}
                >
                  {locationStatus === 'success' ? 'Update Location' : 'Get Location'}
                </Button>
              </Stack>
            </Box>

            {/* Additional Details */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Additional Details (Optional)
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Describe any additional details about the incident..."
                value={report.description || ''}
                onChange={(e) => {
                  dispatch(setDescription(e.target.value));
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          startIcon={<BackIcon />}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          endIcon={<NextIcon />}
          disabled={!report.incidentType || !report.location}
        >
          Next
        </Button>
      </Stack>
    </Box>
  );
};

export default DetailsStep;
