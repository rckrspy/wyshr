import React from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Main Links */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Way-Share
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/about" color="inherit">
                About
              </Link>
              <Link component={RouterLink} to="/map" color="inherit">
                Heat Map
              </Link>
              <Link component={RouterLink} to="/report" color="inherit">
                Report Incident
              </Link>
            </Box>
          </Box>

          {/* Legal Links */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/legal/terms" color="inherit">
                Terms of Service
              </Link>
              <Link component={RouterLink} to="/legal/privacy" color="inherit">
                Privacy Policy
              </Link>
              <Link component={RouterLink} to="/legal/disclaimer" color="inherit">
                Disclaimer
              </Link>
            </Box>
          </Box>

          {/* Support Links */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link component={RouterLink} to="/legal/accessibility" color="inherit">
                Accessibility
              </Link>
              <Link component={RouterLink} to="/legal/cookies" color="inherit">
                Cookie Policy
              </Link>
              <Link component={RouterLink} to="/about#faq" color="inherit">
                FAQ
              </Link>
            </Box>
          </Box>

          {/* Mission Statement */}
          <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
            <Typography variant="h6" gutterBottom>
              Our Mission
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Making roads safer through anonymous, community-driven incident reporting while protecting your privacy.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Copyright and Privacy Notice */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            {'© '}
            {new Date().getFullYear()}{' '}
            Way-Share. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Privacy-first design • Anonymous reporting • Community safety
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;