import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Skeleton,
  Alert,
  Grid,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useGetVehiclesQuery } from '../../store/api/vehicleApiSlice';
import { VehicleCard } from './VehicleCard';

interface VehicleListProps {
  onAddVehicle: () => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({ onAddVehicle }) => {
  const { data: vehicles, isLoading, error } = useGetVehiclesQuery();

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3].map((i) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={32} />
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rectangular" height={60} sx={{ mt: 2 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load vehicles. Please try again later.
      </Alert>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
          bgcolor: 'background.paper',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" gutterBottom>
          No vehicles added yet
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Add your vehicle to receive private notifications when incidents are reported
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddVehicle}
        >
          Add Your First Vehicle
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">
          My Vehicles ({vehicles.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddVehicle}
        >
          Add Vehicle
        </Button>
      </Box>

      <Grid container spacing={3}>
        {vehicles.map((vehicle) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={vehicle.id}>
            <VehicleCard vehicle={vehicle} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};