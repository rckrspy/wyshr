import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useForgotPasswordMutation } from '../../store/api/authApiSlice';
import { Link as RouterLink } from 'react-router-dom';

export const ForgotPasswordForm: React.FC = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateEmail = (): boolean => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail()) {
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      setSuccess(true);
    } catch (error) {
      if ((error as { data?: { error?: string } })?.data?.error) {
        setError((error as { data: { error: string } }).data.error);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    }
  };

  if (success) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom align="center">
          Check Your Email
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          If an account exists with the email {email}, you will receive a password reset link shortly.
        </Alert>
        
        <Typography variant="body1" paragraph align="center">
          Please check your email and follow the instructions to reset your password.
        </Typography>
        
        <Button
          component={RouterLink}
          to="/auth/login"
          startIcon={<ArrowBack />}
          fullWidth
          variant="outlined"
        >
          Back to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h4" gutterBottom align="center">
        Reset Password
      </Typography>
      
      <Typography variant="body1" paragraph align="center" color="text.secondary">
        Enter your email address and we'll send you a link to reset your password.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
        error={!!error}
        margin="normal"
        autoComplete="email"
        autoFocus
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Link component={RouterLink} to="/auth/login" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <ArrowBack fontSize="small" />
          Back to Sign In
        </Link>
      </Box>
    </Box>
  );
};