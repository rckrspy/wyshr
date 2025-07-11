import React, { useState } from 'react';
import {
  TextField,
  Button,
  Box,
  MenuItem,
  Typography,
  Alert,
  Grid,
} from '@mui/material';
import { useCreateVehicleMutation } from '../../store/api/vehicleApiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';

interface AddVehicleFormProps {
  onSuccess?: () => void;
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
];

export const AddVehicleForm: React.FC<AddVehicleFormProps> = ({ onSuccess }) => {
  const dispatch = useAppDispatch();
  const [createVehicle, { isLoading }] = useCreateVehicleMutation();
  
  const [formData, setFormData] = useState({
    licensePlate: '',
    state: '',
    make: '',
    model: '',
    year: '',
    color: '',
    vin: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = 'License plate is required';
    } else if (!/^[A-Z0-9\s-]+$/i.test(formData.licensePlate)) {
      newErrors.licensePlate = 'Invalid license plate format';
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    }

    if (formData.year && (parseInt(formData.year) < 1900 || parseInt(formData.year) > new Date().getFullYear() + 1)) {
      newErrors.year = 'Invalid year';
    }

    if (formData.vin && formData.vin.length !== 17) {
      newErrors.vin = 'VIN must be 17 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createVehicle({
        licensePlate: formData.licensePlate.toUpperCase(),
        state: formData.state,
        make: formData.make || undefined,
        model: formData.model || undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        color: formData.color || undefined,
        vin: formData.vin || undefined,
      }).unwrap();

      dispatch(showNotification({
        message: 'Vehicle added successfully! You can now upload verification documents.',
        type: 'success',
      }));

      handleReset();
      onSuccess?.();
    } catch (error) {
      const errorMessage = (error as { data?: { error?: string } })?.data?.error || 'Failed to add vehicle';
      dispatch(showNotification({
        message: errorMessage,
        type: 'error',
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      licensePlate: '',
      state: '',
      make: '',
      model: '',
      year: '',
      color: '',
      vin: '',
    });
    setErrors({});
  };

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        You'll need to upload insurance or registration documents after adding your vehicle
        to complete the verification process.
      </Alert>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label="License Plate"
                value={formData.licensePlate}
                onChange={handleChange('licensePlate')}
                error={!!errors.licensePlate}
                helperText={errors.licensePlate}
                placeholder="ABC123"
                inputProps={{ maxLength: 15 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                select
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
                error={!!errors.state}
                helperText={errors.state}
              >
                {US_STATES.map(state => (
                  <MenuItem key={state.code} value={state.code}>
                    {state.code}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Optional Information
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Make"
                value={formData.make}
                onChange={handleChange('make')}
                placeholder="Honda"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={handleChange('model')}
                placeholder="Civic"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Year"
                value={formData.year}
                onChange={handleChange('year')}
                error={!!errors.year}
                helperText={errors.year}
                placeholder="2020"
                inputProps={{ maxLength: 4 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Color"
                value={formData.color}
                onChange={handleChange('color')}
                placeholder="Blue"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="VIN (Vehicle Identification Number)"
                value={formData.vin}
                onChange={handleChange('vin')}
                error={!!errors.vin}
                helperText={errors.vin || 'Optional - helps with verification'}
                placeholder="1HGCV1F30JA123456"
                inputProps={{ maxLength: 17 }}
              />
            </Grid>
      </Grid>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          fullWidth
        >
          Add Vehicle
        </Button>
      </Box>
    </Box>
  );
};