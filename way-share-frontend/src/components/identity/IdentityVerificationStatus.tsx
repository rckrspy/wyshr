import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as HourglassIcon,
  ErrorOutline as ErrorIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';
import { useGetVerificationStatusQuery } from '../../store/api/identityApiSlice';
import { IdentityVerificationButton } from './IdentityVerificationButton';
import { format } from 'date-fns';

export const IdentityVerificationStatus: React.FC = () => {
  const { data, isLoading, error } = useGetVerificationStatusQuery();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load verification status. Please try again later.
      </Alert>
    );
  }

  const { isVerified, verification } = data || { isVerified: false, verification: null };

  const getStatusIcon = () => {
    if (!verification) return <ErrorIcon />;
    
    switch (verification.status) {
      case 'verified':
        return <CheckCircleIcon color="success" />;
      case 'processing':
        return <HourglassIcon color="info" />;
      case 'failed':
      case 'cancelled':
        return <CancelIcon color="error" />;
      default:
        return <HourglassIcon color="warning" />;
    }
  };

  const getStatusColor = (): 'default' | 'success' | 'info' | 'error' | 'warning' => {
    if (!verification) return 'default';
    
    switch (verification.status) {
      case 'verified':
        return 'success';
      case 'processing':
        return 'info';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  const getStatusText = () => {
    if (!verification) return 'Not Started';
    
    switch (verification.status) {
      case 'verified':
        return 'Verified';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      case 'cancelled':
        return 'Cancelled';
      case 'pending':
        return 'Pending';
      default:
        return verification.status;
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" component="h2">
              Identity Verification
            </Typography>
            {isVerified && <VerifiedUserIcon color="success" />}
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {getStatusIcon()}
            <Chip
              label={getStatusText()}
              color={getStatusColor()}
              variant="outlined"
            />
          </Box>

          {verification && (
            <Box>
              {verification.verifiedName && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Verified Name: <strong>{verification.verifiedName}</strong>
                </Typography>
              )}
              
              {verification.verifiedAt && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Verified On: {format(new Date(verification.verifiedAt), 'PPP')}
                </Typography>
              )}

              {verification.failureReason && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {verification.failureReason}
                </Alert>
              )}
            </Box>
          )}

          {!isVerified && (
            <Box>
              {verification?.status === 'pending' ? (
                <Alert severity="info">
                  You have a pending verification session. Click the button below to continue.
                </Alert>
              ) : verification?.status === 'processing' ? (
                <Alert severity="info">
                  Your identity verification is being processed. This usually takes a few minutes.
                </Alert>
              ) : (
                <Alert severity="warning">
                  Verify your identity to unlock additional features like vehicle ownership verification.
                </Alert>
              )}

              {verification?.status !== 'processing' && (
                <Box mt={2}>
                  <IdentityVerificationButton fullWidth />
                </Box>
              )}
            </Box>
          )}

          {isVerified && (
            <Alert severity="success" icon={<CheckCircleIcon />}>
              Your identity has been successfully verified! You can now add and verify vehicles.
            </Alert>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};