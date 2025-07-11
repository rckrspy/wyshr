import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Paper, Typography, Box, Button, CircularProgress, Alert } from '@mui/material';
import { Email as EmailIcon, CheckCircle as CheckCircleIcon, Error as ErrorIcon } from '@mui/icons-material';
import { useVerifyEmailMutation } from '../../store/api/authApiSlice';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleVerification = React.useCallback(async () => {
    if (!token) return;
    try {
      await verifyEmail(token).unwrap();
      setVerificationStatus('success');
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error) {
      setVerificationStatus('error');
      const errorMessage = (error as { data?: { message?: string } })?.data?.message || 'Email verification failed. The link may be expired or invalid.';
      setErrorMessage(errorMessage);
    }
  }, [token, verifyEmail, navigate]);

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token, handleVerification]);


  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Check Your Email
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              We've sent you an email with a verification link. Please check your inbox and click the link to verify your account.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the email? Check your spam folder or{' '}
              <Link to="/auth/register" style={{ textDecoration: 'none' }}>
                register again
              </Link>
              .
            </Typography>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {isLoading && (
            <>
              <CircularProgress size={64} sx={{ mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Verifying Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Please wait while we verify your email address...
              </Typography>
            </>
          )}

          {!isLoading && verificationStatus === 'success' && (
            <>
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Email Verified Successfully!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your email has been verified. You will be redirected to the login page in a few seconds.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/auth/login')}>
                Go to Login
              </Button>
            </>
          )}

          {!isLoading && verificationStatus === 'error' && (
            <>
              <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Verification Failed
              </Typography>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                {errorMessage}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate('/auth/register')}>
                  Register Again
                </Button>
                <Button variant="contained" onClick={() => navigate('/auth/login')}>
                  Go to Login
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default VerifyEmailPage;