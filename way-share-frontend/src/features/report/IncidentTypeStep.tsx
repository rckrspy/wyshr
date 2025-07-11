import React from 'react';
import { Box } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setIncidentType, setSelectedCategory, setStep } from '../../store/slices/reportSlice';
import { IncidentTypeSelector } from './IncidentTypeSelector';
import { IncidentType } from '../../types';
import { requiresLicensePlate } from '../../utils/incidentTypeHelpers';

const IncidentTypeStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedCategory } = useAppSelector((state) => state.report);

  const handleCategorySelect = (category: 'vehicle' | 'location' | null) => {
    if (category === null) {
      dispatch(setSelectedCategory(null));
    } else {
      dispatch(setSelectedCategory(category));
    }
  };

  const handleTypeSelect = (type: IncidentType) => {
    dispatch(setIncidentType(type));
    
    // Navigate to appropriate next step based on incident type
    if (requiresLicensePlate(type)) {
      dispatch(setStep('capture')); // Go to license plate capture
    } else {
      dispatch(setStep('details')); // Skip license plate for location-based hazards
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      flexGrow: 1, 
      minHeight: 0 
    }}>
      <IncidentTypeSelector
        selectedCategory={selectedCategory}
        onSelectCategory={handleCategorySelect}
        onSelectType={handleTypeSelect}
      />
    </Box>
  );
};

export default IncidentTypeStep;