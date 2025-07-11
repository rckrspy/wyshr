import React from 'react';
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ButtonProps extends Omit<MuiButtonProps, 'size'> {
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
}

export const Button: React.FC<ButtonProps> = ({
  loading = false,
  size = 'medium',
  children,
  disabled,
  icon,
  iconPosition = 'start',
  ...props
}) => {
  const theme = useTheme();
  
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          minHeight: '44px',
          px: theme.customSpacing.sm,
          py: theme.customSpacing.xs,
          fontSize: '0.875rem',
        };
      case 'large':
        return {
          minHeight: '48px',
          px: theme.customSpacing.lg,
          py: theme.customSpacing.md,
          fontSize: '1.125rem',
        };
      default:
        return {
          minHeight: '44px',
          px: theme.customSpacing.md,
          py: theme.customSpacing.sm,
          fontSize: '1rem',
        };
    }
  };
  
  return (
    <MuiButton
      disabled={disabled || loading}
      sx={{
        ...getSizeStyles(),
        position: 'relative',
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: '2px',
        },
      }}
      {...props}
    >
      {loading && (
        <CircularProgress
          size={16}
          sx={{
            position: 'absolute',
            color: 'inherit',
          }}
        />
      )}
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.customSpacing.xs,
          opacity: loading ? 0 : 1,
        }}
      >
        {icon && iconPosition === 'start' && icon}
        {children}
        {icon && iconPosition === 'end' && icon}
      </Box>
    </MuiButton>
  );
};