import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Alert,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { IdentityVerificationButton } from '../../components/identity/IdentityVerificationButton';

export const IdentityVerificationRefreshPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <RefreshIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Session Expired
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Your identity verification session has expired or needs to be refreshed.
            Please start a new verification session.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2, mb: 3 }}>
            Don't worry! You won't lose any progress. You can start a new session
            and continue where you left off.
          </Alert>

          <Box sx={{ mt: 4 }}>
            <IdentityVerificationButton fullWidth />
            <Button
              variant="text"
              onClick={() => navigate('/user/profile')}
              sx={{ mt: 2 }}
            >
              Return to Profile
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};