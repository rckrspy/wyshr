import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import {
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from '../../store/api/incidentApiSlice';

export const NotificationPreferences = () => {
  const { data, isLoading, error } = useGetNotificationPreferencesQuery();
  const [updatePreferences, { isLoading: isUpdating }] = useUpdateNotificationPreferencesMutation();

  const [preferences, setPreferences] = useState({
    email_incidents: false,
    push_incidents: false,
    email_disputes: false,
    push_disputes: false,
    email_vehicle_updates: false,
    push_vehicle_updates: false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (data) {
      setPreferences(data);
    }
  }, [data]);

  const handleChange = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updatePreferences(preferences).unwrap();
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load notification preferences. Please try again later.
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Choose how you want to be notified about incidents and updates.
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Incident Reports
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Get notified when incidents are reported involving your vehicles
        </Typography>
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.email_incidents}
                onChange={() => handleChange('email_incidents')}
                icon={<EmailIcon />}
                checkedIcon={<EmailIcon />}
              />
            }
            label="Email notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.push_incidents}
                onChange={() => handleChange('push_incidents')}
                icon={<NotificationsIcon />}
                checkedIcon={<NotificationsIcon />}
              />
            }
            label="Push notifications"
          />
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Dispute Updates
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Get notified about updates to your dispute cases
        </Typography>
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.email_disputes}
                onChange={() => handleChange('email_disputes')}
                icon={<EmailIcon />}
                checkedIcon={<EmailIcon />}
              />
            }
            label="Email notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.push_disputes}
                onChange={() => handleChange('push_disputes')}
                icon={<NotificationsIcon />}
                checkedIcon={<NotificationsIcon />}
              />
            }
            label="Push notifications"
          />
        </FormGroup>
      </Paper>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Vehicle Updates
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Get notified about vehicle verification and other updates
        </Typography>
        <FormGroup sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.email_vehicle_updates}
                onChange={() => handleChange('email_vehicle_updates')}
                icon={<EmailIcon />}
                checkedIcon={<EmailIcon />}
              />
            }
            label="Email notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={preferences.push_vehicle_updates}
                onChange={() => handleChange('push_vehicle_updates')}
                icon={<NotificationsIcon />}
                checkedIcon={<NotificationsIcon />}
              />
            }
            label="Push notifications"
          />
        </FormGroup>
      </Paper>

      <Box mt={3}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges || isUpdating}
        >
          Save Preferences
        </Button>
      </Box>
    </Box>
  );
};