import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Fade,
  Slide,
  useTheme,
} from '@mui/material';
import { CheckCircle as CheckIcon } from '@mui/icons-material';

interface SuccessAnimationProps {
  title: string;
  subtitle?: string;
  show: boolean;
  onComplete?: () => void;
}

export const SuccessAnimation: React.FC<SuccessAnimationProps> = ({
  title,
  subtitle,
  show,
  onComplete,
}) => {
  const theme = useTheme();
  const [showContent, setShowContent] = useState(false);
  
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200);
      
      const completeTimer = setTimeout(() => {
        onComplete?.();
      }, 3000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(completeTimer);
      };
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <Fade in={show} timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <Slide in={showContent} direction="up" timeout={300}>
          <Box
            sx={{
              textAlign: 'center',
              color: 'white',
              px: theme.customSpacing.xl,
            }}
          >
            <Box
              sx={{
                mb: theme.customSpacing.lg,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <CheckIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  animation: 'pulse 1.5s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%': {
                      transform: 'scale(1)',
                    },
                    '50%': {
                      transform: 'scale(1.1)',
                    },
                    '100%': {
                      transform: 'scale(1)',
                    },
                  },
                }}
              />
            </Box>
            
            <Typography
              variant="h4"
              sx={{
                mb: theme.customSpacing.md,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>
            
            {subtitle && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Slide>
      </Box>
    </Fade>
  );
};