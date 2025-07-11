import React from 'react';
import { Container, Paper } from '@mui/material';
import { RegisterForm } from '../../features/auth/RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 4, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <RegisterForm />
      </Paper>
    </Container>
  );
};