import React from 'react';
import { Container, Paper } from '@mui/material';
import { LoginForm } from '../../features/auth/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <LoginForm />
      </Paper>
    </Container>
  );
};