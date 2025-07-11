import React from 'react';
import {
  Box,
  Skeleton,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'form' | 'header';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant,
  count = 1,
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="40%" height={20} />
              <Box sx={{ mt: 2 }}>
                <Skeleton variant="rectangular" height={120} />
              </Box>
            </CardContent>
          </Card>
        );
        
      case 'list':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="70%" height={20} />
              <Skeleton variant="text" width="50%" height={16} />
            </Box>
          </Box>
        );
        
      case 'form':
        return (
          <Stack spacing={2}>
            <Skeleton variant="text" width="30%" height={20} />
            <Skeleton variant="rectangular" height={44} />
            <Skeleton variant="text" width="25%" height={20} />
            <Skeleton variant="rectangular" height={44} />
          </Stack>
        );
        
      case 'header':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Skeleton variant="text" width={120} height={32} />
            <Skeleton variant="rectangular" width={80} height={36} />
          </Box>
        );
        
      default:
        return <Skeleton />;
    }
  };
  
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }, (_, index) => (
        <Box key={index}>
          {renderSkeleton()}
        </Box>
      ))}
    </Stack>
  );
};