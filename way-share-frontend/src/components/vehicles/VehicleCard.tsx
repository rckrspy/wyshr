import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  MoreVert as MoreVertIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useDeleteVehicleMutation } from '../../store/api/vehicleApiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';
import { VehicleVerificationDialog } from './VehicleVerificationDialog';

interface VehicleCardProps {
  vehicle: {
    id: string;
    licensePlate: string;
    state: string;
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    status: 'pending_verification' | 'verified' | 'rejected' | 'expired';
    verifiedAt?: string;
    expiresAt?: string;
    createdAt: string;
  };
}

export const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const dispatch = useAppDispatch();
  const [deleteVehicle] = useDeleteVehicleMutation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = async () => {
    try {
      await deleteVehicle(vehicle.id).unwrap();
      dispatch(showNotification({
        message: 'Vehicle removed successfully',
        type: 'success',
      }));
      setDeleteDialogOpen(false);
    } catch {
      dispatch(showNotification({
        message: 'Failed to remove vehicle',
        type: 'error',
      }));
    }
  };

  const getStatusIcon = () => {
    switch (vehicle.status) {
      case 'verified':
        return <CheckCircleIcon color="success" />;
      case 'rejected':
        return <ErrorIcon color="error" />;
      case 'expired':
        return <ScheduleIcon color="warning" />;
      default:
        return <ScheduleIcon color="action" />;
    }
  };

  const getStatusColor = (): 'success' | 'error' | 'warning' | 'default' => {
    switch (vehicle.status) {
      case 'verified':
        return 'success';
      case 'rejected':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = () => {
    switch (vehicle.status) {
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return 'Pending Verification';
    }
  };

  const vehicleDisplay = [
    vehicle.year,
    vehicle.make,
    vehicle.model,
    vehicle.color,
  ].filter(Boolean).join(' ') || 'Vehicle';

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" gap={2}>
              <CarIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              <Box>
                <Typography variant="h6" component="div">
                  {vehicle.licensePlate} - {vehicle.state}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vehicleDisplay}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  {getStatusIcon()}
                  <Chip
                    label={getStatusText()}
                    size="small"
                    color={getStatusColor()}
                    variant="outlined"
                  />
                </Box>
              </Box>
            </Box>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {vehicle.verifiedAt && (
            <Typography variant="caption" color="text.secondary" display="block" mt={2}>
              Verified on {format(new Date(vehicle.verifiedAt), 'MMM d, yyyy')}
            </Typography>
          )}

          {vehicle.expiresAt && (
            <Typography variant="caption" color="text.secondary" display="block">
              Expires on {format(new Date(vehicle.expiresAt), 'MMM d, yyyy')}
            </Typography>
          )}
        </CardContent>

        <CardActions>
          {vehicle.status === 'pending_verification' && (
            <Button
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setVerificationOpen(true)}
            >
              Upload Documents
            </Button>
          )}
          {vehicle.status === 'expired' && (
            <Button
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setVerificationOpen(true)}
            >
              Renew Verification
            </Button>
          )}
          {vehicle.status === 'rejected' && (
            <Button
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setVerificationOpen(true)}
            >
              Retry Verification
            </Button>
          )}
        </CardActions>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleMenuClose();
          setVerificationOpen(true);
        }}>
          <UploadIcon sx={{ mr: 1 }} />
          Manage Documents
        </MenuItem>
        <MenuItem onClick={() => {
          handleMenuClose();
          setDeleteDialogOpen(true);
        }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Remove Vehicle
        </MenuItem>
      </Menu>

      <VehicleVerificationDialog
        open={verificationOpen}
        onClose={() => setVerificationOpen(false)}
        vehicleId={vehicle.id}
        vehicleDisplay={`${vehicle.licensePlate} - ${vehicle.state}`}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Remove Vehicle?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove {vehicle.licensePlate} - {vehicle.state} from your account?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};