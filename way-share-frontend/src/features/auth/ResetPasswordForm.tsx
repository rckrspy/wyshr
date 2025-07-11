import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle } from '@mui/icons-material';
import { useResetPasswordMutation } from '../../store/api/authApiSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);

  const passwordRequirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const allPasswordRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!allPasswordRequirementsMet) {
      newErrors.password = 'Password does not meet all requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!token) {
      setGeneralError('Invalid or missing reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      await resetPassword({
        token,
        password: formData.password,
      }).unwrap();
      
      setSuccess(true);
      
      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      if ((error as { data?: { error?: string } })?.data?.error) {
        setGeneralError((error as { data: { error: string } }).data.error);
      } else {
        setGeneralError('Failed to reset password. The link may be expired.');
      }
    }
  };

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value });
    setErrors({ ...errors, [field]: '' });
  };

  if (!token) {
    return (
      <Box>
        <Alert severity="error">
          Invalid password reset link. Please request a new password reset.
        </Alert>
        <Button
          onClick={() => navigate('/auth/forgot-password')}
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
        >
          Request New Reset Link
        </Button>
      </Box>
    );
  }

  if (success) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom align="center">
          Password Reset Successful
        </Typography>
        
        <Alert severity="success" sx={{ mb: 3 }}>
          Your password has been reset successfully. You will be redirected to the login page shortly.
        </Alert>
        
        <Button
          onClick={() => navigate('/auth/login')}
          fullWidth
          variant="contained"
        >
          Go to Sign In
        </Button>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h4" gutterBottom align="center">
        Set New Password
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {generalError}
        </Alert>
      )}

      <TextField
        fullWidth
        label="New Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange('password')}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
        autoComplete="new-password"
        autoFocus
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {formData.password && (
        <Box sx={{ mt: 1, mb: 2 }}>
          <FormHelperText>Password requirements:</FormHelperText>
          <Box sx={{ ml: 2 }}>
            <Typography
              variant="caption"
              color={passwordRequirements.length ? 'success.main' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {passwordRequirements.length && <CheckCircle fontSize="small" />}
              At least 8 characters
            </Typography>
            <Typography
              variant="caption"
              color={passwordRequirements.uppercase ? 'success.main' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {passwordRequirements.uppercase && <CheckCircle fontSize="small" />}
              One uppercase letter
            </Typography>
            <Typography
              variant="caption"
              color={passwordRequirements.lowercase ? 'success.main' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {passwordRequirements.lowercase && <CheckCircle fontSize="small" />}
              One lowercase letter
            </Typography>
            <Typography
              variant="caption"
              color={passwordRequirements.number ? 'success.main' : 'text.secondary'}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              {passwordRequirements.number && <CheckCircle fontSize="small" />}
              One number
            </Typography>
          </Box>
        </Box>
      )}

      <TextField
        fullWidth
        label="Confirm New Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        margin="normal"
        autoComplete="new-password"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Reset Password'}
      </Button>
    </Box>
  );
};