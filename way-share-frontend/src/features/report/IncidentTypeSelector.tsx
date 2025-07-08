import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Button,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  LocationOn as LocationIcon,
  Warning as WarningIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { IncidentType, IncidentTypeMetadata, IncidentCategory } from '../../types';

interface IncidentTypeSelectorProps {
  onSelectCategory: (category: 'vehicle' | 'location') => void;
  onSelectType: (type: IncidentType) => void;
  selectedCategory?: 'vehicle' | 'location';
}

// Incident type metadata - this would normally come from an API
const incidentCategories: IncidentCategory[] = [
  {
    name: 'vehicle',
    displayName: 'Vehicle-Specific Incidents',
    incidents: [
      // Existing incidents
      { incidentType: IncidentType.SPEEDING, requiresLicensePlate: true, displayName: 'Speeding', description: 'Driving significantly above posted speed limits', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.TAILGATING, requiresLicensePlate: true, displayName: 'Tailgating', description: 'Following too closely behind another vehicle', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.PHONE_USE, requiresLicensePlate: true, displayName: 'Phone Use', description: 'Using mobile device while driving', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.FAILURE_TO_YIELD, requiresLicensePlate: true, displayName: 'Failure to Yield', description: 'Not yielding right of way when required', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.ROAD_RAGE, requiresLicensePlate: true, displayName: 'Road Rage', description: 'Aggressive or violent behavior towards other drivers', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.AGGRESSIVE_DRIVING, requiresLicensePlate: true, displayName: 'Aggressive Driving', description: 'Dangerous driving behaviors', category: 'vehicle', subcategories: [] },
      { incidentType: IncidentType.ILLEGAL_PARKING, requiresLicensePlate: true, displayName: 'Illegal Parking', description: 'Parking in prohibited areas', category: 'vehicle', subcategories: [] },
      // New vehicle incidents
      { incidentType: IncidentType.PARKING_VIOLATIONS, requiresLicensePlate: true, displayName: 'Parking Violations', description: 'Various parking infractions', category: 'vehicle', subcategories: ['Handicap violation', 'Fire zone parking', 'No parking zone', 'Expired meter', 'Blocking driveway', 'Double parking', 'Blocking fire hydrant'] },
      { incidentType: IncidentType.UNSECURED_LOADS, requiresLicensePlate: true, displayName: 'Unsecured Loads', description: 'Dangerous cargo or equipment', category: 'vehicle', subcategories: ['Falling debris', 'Improperly secured cargo', 'Overloaded vehicle', 'Loose equipment'] },
      { incidentType: IncidentType.LITTERING, requiresLicensePlate: true, displayName: 'Littering', description: 'Disposal of trash from vehicle', category: 'vehicle', subcategories: ['Throwing trash', 'Items falling', 'Cigarette disposal', 'Liquid disposal'] },
      { incidentType: IncidentType.FAILURE_TO_SIGNAL, requiresLicensePlate: true, displayName: 'Failure to Signal', description: 'Not using turn signals properly', category: 'vehicle', subcategories: ['No turn signal', 'No lane change signal', 'Broken signal lights'] },
      { incidentType: IncidentType.IMPAIRED_DRIVING, requiresLicensePlate: true, displayName: 'Impaired Driving', description: 'Suspected intoxication or impairment', category: 'vehicle', subcategories: ['Suspected DUI', 'Erratic behavior', 'Swerving', 'Inconsistent speed'] },
      { incidentType: IncidentType.RECKLESS_DRIVING, requiresLicensePlate: true, displayName: 'Reckless Driving', description: 'Extremely dangerous driving', category: 'vehicle', subcategories: ['Running red lights', 'Running stop signs', 'Dangerous maneuvers', 'Wrong way driving'] },
    ]
  },
  {
    name: 'location',
    displayName: 'Location-Based Hazards',
    incidents: [
      { incidentType: IncidentType.ROCK_CHIPS, requiresLicensePlate: false, displayName: 'Rock Chips', description: 'Road surface causing windshield damage', category: 'location', subcategories: [] },
      { incidentType: IncidentType.POTHOLES, requiresLicensePlate: false, displayName: 'Potholes', description: 'Road surface hazards requiring repair', category: 'location', subcategories: [] },
      { incidentType: IncidentType.ROAD_SURFACE_ISSUES, requiresLicensePlate: false, displayName: 'Road Surface Issues', description: 'General road surface problems', category: 'location', subcategories: ['Damaged pavement', 'Missing lane markings', 'Uneven surface', 'Cracks'] },
      { incidentType: IncidentType.TRAFFIC_SIGNAL_PROBLEMS, requiresLicensePlate: false, displayName: 'Traffic Signal Problems', description: 'Issues with traffic control devices', category: 'location', subcategories: ['Broken lights', 'Timing issues', 'Power outage', 'Malfunctioning signals'] },
      { incidentType: IncidentType.DANGEROUS_ROAD_CONDITIONS, requiresLicensePlate: false, displayName: 'Dangerous Road Conditions', description: 'Environmental or infrastructure hazards', category: 'location', subcategories: ['Ice', 'Flooding', 'Construction hazards', 'Poor visibility', 'Missing signs', 'Broken guardrails', 'Streetlight outages'] },
      { incidentType: IncidentType.DEBRIS_IN_ROAD, requiresLicensePlate: false, displayName: 'Debris in Road', description: 'Objects blocking or endangering traffic', category: 'location', subcategories: ['Large objects', 'Construction materials', 'Accident debris', 'Natural debris'] },
      { incidentType: IncidentType.DEAD_ANIMALS, requiresLicensePlate: false, displayName: 'Dead Animals', description: 'Roadkill creating driving hazards', category: 'location', subcategories: [] },
      { incidentType: IncidentType.FALLEN_OBSTACLES, requiresLicensePlate: false, displayName: 'Fallen Obstacles', description: 'Natural obstacles on roadway', category: 'location', subcategories: ['Trees', 'Branches', 'Rocks', 'Mudslide'] },
    ]
  }
];

export const IncidentTypeSelector: React.FC<IncidentTypeSelectorProps> = ({ 
  onSelectCategory, 
  onSelectType,
  selectedCategory 
}) => {
  if (!selectedCategory) {
    // Show category selection
    return (
      <Box sx={{ minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            What type of incident are you reporting?
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Choose the category that best describes your report
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 3 },
                transition: 'box-shadow 0.2s',
                height: '100%'
              }}
              onClick={() => onSelectCategory('vehicle')}
            >
              <CardHeader
                avatar={<CarIcon color="primary" sx={{ fontSize: 40 }} />}
                action={<ChevronRightIcon color="action" />}
                title="Vehicle-Specific Incidents"
                subheader="Report dangerous driving behaviors or vehicle violations. License plate required."
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Examples: Speeding, tailgating, phone use, parking violations, etc.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                '&:hover': { boxShadow: 3 },
                transition: 'box-shadow 0.2s',
                height: '100%'
              }}
              onClick={() => onSelectCategory('location')}
            >
              <CardHeader
                avatar={<LocationIcon color="success" sx={{ fontSize: 40 }} />}
                action={<ChevronRightIcon color="action" />}
                title="Location-Based Hazards"
                subheader="Report road conditions and environmental hazards. No license plate needed."
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Examples: Potholes, debris, signal problems, road damage, etc.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Show incident type selection for the selected category
  const category = incidentCategories.find(cat => cat.name === selectedCategory);
  if (!category) return null;

  return (
    <Box sx={{ minHeight: '400px' }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Select the specific incident type
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {category.displayName}
        </Typography>
      </Box>

      <Stack spacing={2}>
        {category.incidents.map((incident) => (
          <Card
            key={incident.incidentType}
            sx={{ 
              cursor: 'pointer', 
              '&:hover': { boxShadow: 2 },
              transition: 'box-shadow 0.2s'
            }}
            onClick={() => onSelectType(incident.incidentType)}
          >
            <CardHeader
              avatar={<WarningIcon color="warning" />}
              action={<ChevronRightIcon color="action" />}
              title={incident.displayName}
              subheader={incident.description}
            />
            {incident.subcategories.length > 0 && (
              <CardContent sx={{ pt: 0 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {incident.subcategories.slice(0, 3).map((sub, idx) => (
                    <Chip key={idx} label={sub} size="small" variant="outlined" />
                  ))}
                  {incident.subcategories.length > 3 && (
                    <Chip 
                      label={`+${incident.subcategories.length - 3} more`} 
                      size="small" 
                      variant="outlined"
                      color="secondary"
                    />
                  )}
                </Stack>
              </CardContent>
            )}
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => onSelectCategory(undefined as any)}
          fullWidth
        >
          Back to Categories
        </Button>
      </Box>
    </Box>
  );
};