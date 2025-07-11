import React from 'react';
import { Container, Paper } from '@mui/material';
import { ForgotPasswordForm } from '../../features/auth/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <ForgotPasswordForm />
      </Paper>
    </Container>
  );
};