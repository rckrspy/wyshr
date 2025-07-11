import React from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface FormFieldProps extends Omit<TextFieldProps, 'variant'> {
  label: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  description?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  description,
  ...props
}) => {
  const theme = useTheme();
  
  return (
    <FormControl fullWidth error={error}>
      <FormLabel
        component="label"
        sx={{
          mb: theme.customSpacing.xs,
          fontWeight: 500,
          color: error ? 'error.main' : 'text.primary',
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: 'error.main', ml: 0.5 }}>
            *
          </Box>
        )}
      </FormLabel>
      
      {description && (
        <FormHelperText sx={{ mb: theme.customSpacing.xs, mt: 0 }}>
          {description}
        </FormHelperText>
      )}
      
      <TextField
        variant="outlined"
        error={error}
        sx={{
          '& .MuiOutlinedInput-root': {
            minHeight: '44px',
            borderRadius: theme.shape.borderRadius + 'px',
          },
          '& .MuiInputBase-input': {
            fontSize: '1rem',
            lineHeight: 1.5,
          },
        }}
        {...props}
      />
      
      {helperText && (
        <FormHelperText>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};