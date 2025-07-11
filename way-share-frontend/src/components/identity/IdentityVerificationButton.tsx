import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { Badge as BadgeIcon } from '@mui/icons-material';
import { useCreateVerificationSessionMutation } from '../../store/api/identityApiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';

interface IdentityVerificationButtonProps {
  variant?: 'contained' | 'outlined' | 'text';
  fullWidth?: boolean;
}

export const IdentityVerificationButton: React.FC<IdentityVerificationButtonProps> = ({
  variant = 'contained',
  fullWidth = false,
}) => {
  const dispatch = useAppDispatch();
  const [createSession, { isLoading }] = useCreateVerificationSessionMutation();

  const handleVerification = async () => {
    try {
      const returnUrl = `${window.location.origin}/identity/success`;
      const refreshUrl = `${window.location.origin}/identity/refresh`;

      const result = await createSession({
        returnUrl,
        refreshUrl,
      }).unwrap();

      // Redirect to Stripe Identity verification
      window.location.href = result.url;
    } catch (error) {
      console.error('Failed to create verification session:', error);
      dispatch(
        showNotification({
          message: 'Failed to start identity verification. Please try again.',
          type: 'error',
        })
      );
    }
  };

  return (
    <Button
      variant={variant}
      color="primary"
      fullWidth={fullWidth}
      onClick={handleVerification}
      disabled={isLoading}
      startIcon={isLoading ? <CircularProgress size={20} /> : <BadgeIcon />}
    >
      {isLoading ? 'Starting Verification...' : 'Verify Your Identity'}
    </Button>
  );
};