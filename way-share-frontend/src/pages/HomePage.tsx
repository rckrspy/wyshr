import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Stack,
} from '@mui/material';
import {
  Report as ReportIcon,
  Map as MapIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  VerifiedUser as VerifiedUserIcon,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <SecurityIcon fontSize="large" />,
      title: 'Privacy First',
      description: 'All reports are anonymized. No personal data is stored.',
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Quick Reporting',
      description: 'Submit a report in under 30 seconds with our streamlined process.',
    },
    {
      icon: <GroupsIcon fontSize="large" />,
      title: 'Community Driven',
      description: 'Help make San Jose roads safer through collective action.',
    },
    {
      icon: <VerifiedUserIcon fontSize="large" />,
      title: 'No Account Needed',
      description: 'Report incidents without creating an account or sharing personal info.',
    },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Report Traffic Incidents Anonymously
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Help make San Jose roads safer. Report dangerous driving behavior in seconds.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<ReportIcon />}
            onClick={() => navigate('/report')}
          >
            Report an Incident
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<MapIcon />}
            onClick={() => navigate('/map')}
          >
            View Heat Map
          </Button>
        </Stack>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" textAlign="center" gutterBottom>
          Why Way-Share?
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" paragraph>
            Join thousands of San Jose residents in creating safer streets for everyone.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'grey.100',
              },
            }}
            onClick={() => navigate('/report')}
          >
            Start Reporting Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;