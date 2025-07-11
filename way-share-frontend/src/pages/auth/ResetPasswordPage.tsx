import React from 'react';
import { Container, Paper } from '@mui/material';
import { ResetPasswordForm } from '../../features/auth/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <ResetPasswordForm />
      </Paper>
    </Container>
  );
};