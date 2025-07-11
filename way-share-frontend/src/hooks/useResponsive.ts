import { useMediaQuery, useTheme } from '@mui/material';

export const useResponsive = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Only true mobile devices
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg')); // Tablets and small laptops
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg')); // Large screens
  const isTouch = useMediaQuery('(hover: none)');
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouch,
    breakpoint: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};