import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { ScoreBreakdown as ScoreBreakdownType } from '../../store/api/driverScoreApiSlice';

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownType[];
  loading?: boolean;
}

const formatIncidentType = (type: string): string => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({
  breakdown,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (breakdown.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Score Breakdown
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No incidents recorded yet. Keep driving safely!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const maxImpact = Math.max(...breakdown.map(b => Math.abs(b.totalImpact)));

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Score Breakdown by Incident Type
        </Typography>
        <List>
          {breakdown.map((item) => (
            <ListItem key={item.incidentType} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">
                  {formatIncidentType(item.incidentType)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip 
                    label={`${item.count} incident${item.count !== 1 ? 's' : ''}`} 
                    size="small" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${item.totalImpact} points`} 
                    size="small" 
                    color="error" 
                  />
                </Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(Math.abs(item.totalImpact) / maxImpact) * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#f44336',
                    borderRadius: 4,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Focus on reducing incidents in categories with the highest impact to improve your score faster.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};