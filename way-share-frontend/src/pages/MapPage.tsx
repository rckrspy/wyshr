import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
} from '@mui/material';
import { useGetHeatMapDataQuery, useGetIncidentStatsQuery } from '../store/api/apiSlice';
import { IncidentType } from '../types';
import HeatMap from '../features/map/HeatMap';

const MapPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [incidentType, setIncidentType] = useState<string>('all');

  const { data: heatMapData, isLoading: isLoadingMap } = useGetHeatMapDataQuery({
    timeRange,
    incidentType: incidentType === 'all' ? undefined : incidentType,
  });

  const { data: stats, isLoading: isLoadingStats } = useGetIncidentStatsQuery();

  const handleTimeRangeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newTimeRange: string | null
  ) => {
    if (newTimeRange !== null) {
      setTimeRange(newTimeRange);
    }
  };

  const incidentTypeLabels: Record<IncidentType, string> = {
    [IncidentType.SPEEDING]: 'Speeding',
    [IncidentType.TAILGATING]: 'Tailgating',
    [IncidentType.PHONE_USE]: 'Phone Use',
    [IncidentType.FAILURE_TO_YIELD]: 'Failure to Yield',
    [IncidentType.ILLEGAL_PARKING]: 'Illegal Parking',
    [IncidentType.ROAD_RAGE]: 'Road Rage',
    [IncidentType.AGGRESSIVE_DRIVING]: 'Aggressive Driving',
    [IncidentType.PARKING_VIOLATIONS]: 'Parking Violations',
    [IncidentType.UNSECURED_LOADS]: 'Unsecured Loads',
    [IncidentType.LITTERING]: 'Littering',
    [IncidentType.FAILURE_TO_SIGNAL]: 'Failure to Signal',
    [IncidentType.IMPAIRED_DRIVING]: 'Impaired Driving',
    [IncidentType.RECKLESS_DRIVING]: 'Reckless Driving',
    [IncidentType.ROCK_CHIPS]: 'Rock Chips',
    [IncidentType.POTHOLES]: 'Potholes',
    [IncidentType.DEBRIS_IN_ROAD]: 'Debris in Road',
    [IncidentType.ROAD_SURFACE_ISSUES]: 'Road Surface Issues',
    [IncidentType.TRAFFIC_SIGNAL_PROBLEMS]: 'Traffic Signal Problems',
    [IncidentType.DANGEROUS_ROAD_CONDITIONS]: 'Dangerous Road Conditions',
    [IncidentType.DEAD_ANIMALS]: 'Dead Animals',
    [IncidentType.FALLEN_OBSTACLES]: 'Fallen Obstacles',
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          San Jose Traffic Incident Heat Map
        </Typography>
        
        {/* Filters */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
              fullWidth
            >
              <ToggleButton value="24h" aria-label="24 hours">
                24 Hours
              </ToggleButton>
              <ToggleButton value="7d" aria-label="7 days">
                7 Days
              </ToggleButton>
              <ToggleButton value="30d" aria-label="30 days">
                30 Days
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Incident Type</InputLabel>
              <Select
                value={incidentType}
                label="Incident Type"
                onChange={(e) => setIncidentType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                {Object.entries(incidentTypeLabels).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Stats */}
        {stats && !isLoadingStats && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Reports: {stats.total}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(stats.byType).map(([type, count]) => (
                  <Chip
                    key={type}
                    label={`${incidentTypeLabels[type as IncidentType]}: ${count}`}
                    color={type === incidentType ? 'primary' : 'default'}
                    size="small"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Map */}
      <Paper sx={{ flexGrow: 1, position: 'relative', maxHeight: 'calc(100vh - 300px)', overflow: 'hidden' }}>
        {isLoadingMap ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <HeatMap data={heatMapData} />
        )}
      </Paper>
    </Box>
  );
};

export default MapPage;