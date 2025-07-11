import React from 'react';
import {
  Box,
  Container,
  useTheme,
} from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import { useResponsive } from '../../hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  maxWidth = 'lg',
  disableGutters = false 
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      <Header />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: theme.customSpacing.sm, md: theme.customSpacing.md },
          pb: { xs: theme.customSpacing.lg, md: theme.customSpacing.xl },
        }}
      >
        <Container
          maxWidth={maxWidth}
          disableGutters={disableGutters || isMobile}
          sx={{
            px: {
              xs: theme.customSpacing.md,    // Mobile phones
              sm: theme.customSpacing.lg,    // Tablets
              md: theme.customSpacing.lg,    // Small laptops
              lg: theme.customSpacing.xl,    // Desktop
            },
          }}
        >
          {children}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

export default Layout;