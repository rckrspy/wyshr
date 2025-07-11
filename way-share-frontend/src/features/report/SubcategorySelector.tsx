import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

interface SubcategorySelectorProps {
  subcategories: string[];
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export const SubcategorySelector: React.FC<SubcategorySelectorProps> = ({
  subcategories,
  value,
  onChange,
  required = false
}) => {
  if (!subcategories || subcategories.length === 0) {
    return null;
  }

  return (
    <Box>
      <FormControl fullWidth>
        <InputLabel id="subcategory-label">
          Specific Issue {required && <span style={{ color: 'red' }}>*</span>}
        </InputLabel>
        <Select
          labelId="subcategory-label"
          value={value || ''}
          label={`Specific Issue ${required ? '*' : ''}`}
          onChange={(e) => onChange(e.target.value)}
        >
          {subcategories.map((subcategory) => (
            <MenuItem key={subcategory} value={subcategory}>
              {subcategory}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};