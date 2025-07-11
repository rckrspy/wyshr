import React from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Button,
  Stack,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  DirectionsCar as CarIcon,
} from '@mui/icons-material';
import { useGetProfileQuery } from '../../store/api/authApiSlice';
import { IdentityVerificationStatus } from '../../components/identity/IdentityVerificationStatus';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useGetProfileQuery();

  return (
    <ProtectedRoute>
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Box sx={{ py: 4, maxWidth: '1400px', mx: 'auto' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Profile
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            {/* User Information Card */}
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  {data?.user && (
                    <Stack spacing={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon color="action" />
                        <Typography variant="body1">{data.user.email}</Typography>
                        {data.user.emailVerified && (
                          <Chip label="Verified" size="small" color="success" />
                        )}
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <AccountCircleIcon color="action" />
                        <Typography variant="body1">
                          Account ID: {data.user.id.slice(0, 8)}...
                        </Typography>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1}>
                        <CalendarIcon color="action" />
                        <Typography variant="body1">
                          Member since {data.user.createdAt ? format(new Date(data.user.createdAt), 'MMMM yyyy') : 'Unknown'}
                        </Typography>
                      </Box>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Identity Verification Card */}
            <Box>
              <IdentityVerificationStatus />
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            {/* Vehicle Management Card */}
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CarIcon />
                      <Typography variant="h6">My Vehicles</Typography>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/user/vehicles')}
                    >
                      Manage Vehicles
                    </Button>
                  </Box>
                  <Divider />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Add and verify your vehicles to receive private notifications when they're
                    reported in incidents. Identity verification is required before adding vehicles.
                  </Typography>
                </CardContent>
              </Card>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
            {/* Driver Score Card (placeholder) */}
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Driver Score
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Coming soon! Your driver score will be displayed here once you have
                    verified vehicles and the scoring system is active.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Incident History Card (placeholder) */}
            <Box>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Incident History
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Your incident history will appear here once you have verified vehicles
                    and incidents have been reported.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Container>
    </ProtectedRoute>
  );
};