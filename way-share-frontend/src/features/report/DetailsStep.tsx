import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
} from '@mui/material';
import {
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  setLocation,
  setDescription,
  setSubcategory,
  setStep,
} from '../../store/slices/reportSlice';
import { showNotification } from '../../store/slices/uiSlice';
import { IncidentType } from '../../types';
import { requiresLicensePlate, getIncidentTypeDisplayName } from '../../utils/incidentTypeHelpers';
import { SubcategorySelector } from './SubcategorySelector';
import { IncidentTypeSelector } from './IncidentTypeSelector';

// Get subcategories for incident types
const getSubcategories = (incidentType: IncidentType): string[] => {
  const subcategoriesMap: Partial<Record<IncidentType, string[]>> = {
    [IncidentType.PARKING_VIOLATIONS]: ['Handicap violation', 'Fire zone parking', 'No parking zone', 'Expired meter', 'Blocking driveway', 'Double parking', 'Blocking fire hydrant'],
    [IncidentType.UNSECURED_LOADS]: ['Falling debris', 'Improperly secured cargo', 'Overloaded vehicle', 'Loose equipment'],
    [IncidentType.LITTERING]: ['Throwing trash', 'Items falling', 'Cigarette disposal', 'Liquid disposal'],
    [IncidentType.FAILURE_TO_SIGNAL]: ['No turn signal', 'No lane change signal', 'Broken signal lights'],
    [IncidentType.IMPAIRED_DRIVING]: ['Suspected DUI', 'Erratic behavior', 'Swerving', 'Inconsistent speed'],
    [IncidentType.RECKLESS_DRIVING]: ['Running red lights', 'Running stop signs', 'Dangerous maneuvers', 'Wrong way driving'],
    [IncidentType.ROAD_SURFACE_ISSUES]: ['Damaged pavement', 'Missing lane markings', 'Uneven surface', 'Cracks'],
    [IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: ['Broken lights', 'Timing issues', 'Power outage', 'Malfunctioning signals'],
    [IncidentType.DANGEROUS_ROAD_CONDITIONS]: ['Ice', 'Flooding', 'Construction hazards', 'Poor visibility', 'Missing signs', 'Broken guardrails', 'Streetlight outages'],
    [IncidentType.DEBRIS_IN_ROAD]: ['Large objects', 'Construction materials', 'Accident debris', 'Natural debris'],
    [IncidentType.FALLEN_OBSTACLES]: ['Trees', 'Branches', 'Rocks', 'Mudslide'],
  };
  return subcategoriesMap[incidentType] || [];
};

const incidentTypeInfo: Record<IncidentType, { label: string; description: string }> = {
  [IncidentType.SPEEDING]: {
    label: 'Speeding',
    description: 'Driving significantly above the posted speed limit',
  },
  [IncidentType.TAILGATING]: {
    label: 'Tailgating',
    description: 'Following too closely behind another vehicle',
  },
  [IncidentType.PHONE_USE]: {
    label: 'Phone Use',
    description: 'Using a mobile phone while driving',
  },
  [IncidentType.FAILURE_TO_YIELD]: {
    label: 'Failure to Yield',
    description: 'Not yielding right of way when required',
  },
  [IncidentType.ILLEGAL_PARKING]: {
    label: 'Illegal Parking',
    description: 'Parking in prohibited areas',
  },
  [IncidentType.ROAD_RAGE]: {
    label: 'Road Rage',
    description: 'Aggressive or violent behavior towards other drivers',
  },
  [IncidentType.AGGRESSIVE_DRIVING]: {
    label: 'Aggressive Driving',
    description: 'Dangerous driving behaviors',
  },
  [IncidentType.PARKING_VIOLATIONS]: {
    label: 'Parking Violations',
    description: 'Various parking infractions',
  },
  [IncidentType.UNSECURED_LOADS]: {
    label: 'Unsecured Loads',
    description: 'Dangerous cargo or equipment',
  },
  [IncidentType.LITTERING]: {
    label: 'Littering',
    description: 'Disposal of trash from vehicle',
  },
  [IncidentType.FAILURE_TO_SIGNAL]: {
    label: 'Failure to Signal',
    description: 'Not using turn signals properly',
  },
  [IncidentType.IMPAIRED_DRIVING]: {
    label: 'Impaired Driving',
    description: 'Suspected intoxication or impairment',
  },
  [IncidentType.RECKLESS_DRIVING]: {
    label: 'Reckless Driving',
    description: 'Extremely dangerous driving',
  },
  [IncidentType.ROCK_CHIPS]: {
    label: 'Rock Chips',
    description: 'Road surface causing windshield damage',
  },
  [IncidentType.POTHOLES]: {
    label: 'Potholes',
    description: 'Road surface hazards requiring repair',
  },
  [IncidentType.DEBRIS_IN_ROAD]: {
    label: 'Debris in Road',
    description: 'Objects blocking or endangering traffic',
  },
  [IncidentType.ROAD_SURFACE_ISSUES]: {
    label: 'Road Surface Issues',
    description: 'General road surface problems',
  },
  [IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: {
    label: 'Traffic Signal Problems',
    description: 'Issues with traffic control devices',
  },
  [IncidentType.DANGEROUS_ROAD_CONDITIONS]: {
    label: 'Dangerous Road Conditions',
    description: 'Environmental or infrastructure hazards',
  },
  [IncidentType.DEAD_ANIMALS]: {
    label: 'Dead Animals',
    description: 'Roadkill creating driving hazards',
  },
  [IncidentType.FALLEN_OBSTACLES]: {
    label: 'Fallen Obstacles',
    description: 'Natural obstacles on roadway',
  },
};

const DetailsStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const report = useAppSelector((state) => state.report.currentReport);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  useEffect(() => {
    // Get current location on mount
    if (!report?.location && locationStatus === 'idle') {
      getCurrentLocation();
    }
  }, [report?.location, locationStatus]);

  const getCurrentLocation = () => {
    setLocationStatus('loading');
    
    if (!navigator.geolocation) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Geolocation is not supported by your browser',
        })
      );
      setLocationStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check if location is within San Jose area (approximate bounds)
        if (latitude < 37.0 || latitude > 37.5 || longitude < -122.2 || longitude > -121.6) {
          dispatch(
            showNotification({
              type: 'warning',
              message: 'Location appears to be outside San Jose area',
            })
          );
        }

        dispatch(setLocation({ lat: latitude, lng: longitude }));
        setLocationStatus('success');
      },
      (_error) => {
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
  };

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
          message: 'Location is required. Please enable location access.',
        })
      );
      return;
    }

    dispatch(setStep('review'));
  };

  const handleBack = () => {
    // Navigate back to appropriate step based on incident type
    if (report?.incidentType && requiresLicensePlate(report.incidentType)) {
      dispatch(setStep('capture'));
    } else {
      dispatch(setStep('incidentType'));
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Incident Details
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Provide details about the traffic incident you witnessed.
      </Typography>

      <Stack spacing={3}>
        {/* Display selected incident type */}
        {report?.incidentType && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Incident Type
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {getIncidentTypeDisplayName(report.incidentType)}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Subcategory Selection */}
        {report?.incidentType && getSubcategories(report.incidentType).length > 0 && (
          <SubcategorySelector
            subcategories={getSubcategories(report.incidentType)}
            value={report.subcategory}
            onChange={(value) => dispatch(setSubcategory(value))}
          />
        )}

        {/* Location */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Location
          </Typography>
          {locationStatus === 'loading' && (
            <Alert severity="info">Getting your current location...</Alert>
          )}
          {locationStatus === 'error' && (
            <Alert severity="error">
              Unable to get location. Please enable location access and try again.
              <Button size="small" onClick={getCurrentLocation} sx={{ ml: 2 }}>
                Retry
              </Button>
            </Alert>
          )}
          {locationStatus === 'success' && report?.location && (
            <Alert
              severity="success"
              icon={<LocationIcon />}
              action={
                <Button size="small" onClick={getCurrentLocation}>
                  Update
                </Button>
              }
            >
              Location captured (will be rounded to nearest 100m for privacy)
            </Alert>
          )}
        </Box>

        {/* Description */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description (Optional)"
          value={report?.description || ''}
          onChange={(e) => dispatch(setDescription(e.target.value))}
          placeholder="Provide any additional details about the incident..."
          helperText={`${report?.description?.length || 0}/500 characters`}
          inputProps={{ maxLength: 500 }}
        />

        <Alert severity="info">
          Your location will be rounded to the nearest 100 meters to protect your privacy.
        </Alert>

        {/* Navigation Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={handleBack}
              fullWidth
            >
              Back
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              endIcon={<NextIcon />}
              onClick={handleNext}
              fullWidth
              disabled={!report?.incidentType || !report?.location}
            >
              Review Report
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default DetailsStep;