import React, { useState } from 'react';
import {
  Container,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { PageHeader } from '../../components/layout/PageHeader';
import { VehicleList } from '../../components/vehicles/VehicleList';
import { AddVehicleForm } from '../../components/vehicles/AddVehicleForm';

export const VehicleManagement: React.FC = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const handleAddVehicle = () => {
    setAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setAddDialogOpen(false);
  };

  const handleVehicleAdded = () => {
    setAddDialogOpen(false);
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <PageHeader
        title="Vehicle Management"
        subtitle="Add and verify your vehicles to receive private incident notifications"
      />

      <Box sx={{ mb: 3 }}>
        <Alert severity="info">
          Verify your vehicle ownership to receive private notifications when incidents involving 
          your vehicle are reported. Your vehicle information is kept secure and is never shared 
          with reporters.
        </Alert>
      </Box>

      <VehicleList onAddVehicle={handleAddVehicle} />

      <Dialog
        open={addDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Add Vehicle
          <IconButton
            sx={{ position: 'absolute', right: 8, top: 8 }}
            onClick={handleCloseDialog}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <AddVehicleForm onSuccess={handleVehicleAdded} />
        </DialogContent>
      </Dialog>
      </Box>
    </Container>
  );
};