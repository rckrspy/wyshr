import React from 'react';
import {
  Box,
  Typography,
  Step,
  StepLabel,
  Stepper,
  useTheme,
} from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { useResponsive } from '../../hooks/useResponsive';

interface StepIndicatorProps {
  steps: string[];
  activeStep: number;
  completedSteps?: number[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  activeStep,
  completedSteps = [],
}) => {
  const theme = useTheme();
  const { isMobile } = useResponsive();
  
  if (isMobile) {
    // Mobile: Simple progress indicator
    return (
      <Box sx={{ mb: theme.customSpacing.lg }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: theme.customSpacing.sm,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {steps.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Math.round(((activeStep + 1) / steps.length) * 100)}%
          </Typography>
        </Box>
        
        <Box
          sx={{
            width: '100%',
            height: 4,
            backgroundColor: 'grey.200',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${((activeStep + 1) / steps.length) * 100}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              transition: 'width 0.3s ease-in-out',
            }}
          />
        </Box>
        
        <Typography
          variant="h6"
          sx={{ mt: theme.customSpacing.md, textAlign: 'center' }}
        >
          {steps[activeStep]}
        </Typography>
      </Box>
    );
  }
  
  // Desktop: Full stepper
  return (
    <Box sx={{ mb: theme.customSpacing.xl }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label} completed={completedSteps.includes(index)}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: completed
                      ? 'success.main'
                      : active
                      ? 'primary.main'
                      : 'grey.300',
                    color: completed || active ? 'white' : 'grey.600',
                    fontWeight: 600,
                  }}
                >
                  {completed ? <CheckIcon sx={{ fontSize: 18 }} /> : index + 1}
                </Box>
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};