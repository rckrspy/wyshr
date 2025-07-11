import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Paper,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import { useCheckSessionStatusQuery } from '../../store/api/identityApiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';

export const IdentityVerificationSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('verification_session_id');

  const { data, isLoading, error } = useCheckSessionStatusQuery(sessionId || '', {
    skip: !sessionId,
  });

  useEffect(() => {
    if (!sessionId) {
      navigate('/user/profile');
    }
  }, [sessionId, navigate]);

  useEffect(() => {
    if (data) {
      if (data.status === 'verified') {
        dispatch(
          showNotification({
            message: 'Identity verification completed successfully!',
            type: 'success',
          })
        );
      } else if (data.status === 'requires_input') {
        // Redirect back to Stripe if more input is needed
        if (data.url) {
          window.location.href = data.url;
        }
      }
    }
  }, [data, dispatch]);

  if (isLoading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Checking verification status...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error || !data) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Alert severity="error" icon={<ErrorIcon />}>
            Failed to check verification status. Please try again.
          </Alert>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={() => navigate('/user/profile')}>
              Return to Profile
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  const isSuccess = data.status === 'verified';

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {isSuccess ? (
            <>
              <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Verification Complete!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your identity has been successfully verified. You can now add and verify
                vehicles to receive private notifications about incidents.
              </Typography>
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/user/vehicles')}
                  sx={{ mr: 2 }}
                >
                  Add Your Vehicles
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/user/profile')}
                >
                  Go to Profile
                </Button>
              </Box>
            </>
          ) : (
            <>
              <ErrorIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Verification Incomplete
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Your identity verification is not yet complete. Status: {data.status}
              </Typography>
              {data.lastError && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {data.lastError.message || 'Verification failed'}
                </Alert>
              )}
              <Box sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/user/profile')}
                >
                  Return to Profile
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};