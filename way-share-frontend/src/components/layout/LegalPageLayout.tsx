import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Home as HomeIcon, Gavel as LegalIcon } from '@mui/icons-material';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component={RouterLink}
          to="/"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link
          component={RouterLink}
          to="/legal/terms"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
        >
          <LegalIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Legal
        </Link>
        <Typography color="text.primary">{title}</Typography>
      </Breadcrumbs>

      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated}
          </Typography>
          <Divider sx={{ mt: 2 }} />
        </Box>

        {/* Page Content */}
        <Box sx={{ '& h2': { mt: 4, mb: 2 }, '& h3': { mt: 3, mb: 1.5 } }}>
          {children}
        </Box>

        {/* Contact Information */}
        <Divider sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary">
          If you have questions about this page, please contact us through our{' '}
          <Link component={RouterLink} to="/about">
            About page
          </Link>
          .
        </Typography>
      </Paper>

      {/* Legal Navigation */}
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Legal Information
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Link component={RouterLink} to="/legal/terms">
            Terms of Service
          </Link>
          <Link component={RouterLink} to="/legal/privacy">
            Privacy Policy
          </Link>
          <Link component={RouterLink} to="/legal/disclaimer">
            Disclaimer
          </Link>
          <Link component={RouterLink} to="/legal/accessibility">
            Accessibility
          </Link>
          <Link component={RouterLink} to="/legal/cookies">
            Cookie Policy
          </Link>
        </Box>
      </Paper>
    </Container>
  );
};

export default LegalPageLayout;