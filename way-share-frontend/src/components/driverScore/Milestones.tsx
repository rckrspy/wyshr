import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Favorite,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Milestone } from '../../store/api/driverScoreApiSlice';

interface MilestonesProps {
  milestones: Milestone[];
  loading?: boolean;
}

const getMilestoneIcon = (type: string) => {
  switch (type) {
    case 'perfect_score':
      return <Star sx={{ color: '#ffd700' }} />;
    case 'improvement':
      return <TrendingUp sx={{ color: '#4caf50' }} />;
    case 'streak':
      return <EmojiEvents sx={{ color: '#ff9800' }} />;
    case 'recovery':
      return <Favorite sx={{ color: '#e91e63' }} />;
    default:
      return <Star sx={{ color: '#757575' }} />;
  }
};

const getMilestoneTitle = (type: string, value: number): string => {
  switch (type) {
    case 'perfect_score':
      return 'Perfect Score!';
    case 'improvement':
      return `${value} Point Improvement`;
    case 'streak':
      return `${value} Day Safe Driving Streak`;
    case 'recovery':
      return 'Score Recovery';
    default:
      return 'Achievement Unlocked';
  }
};

const getMilestoneDescription = (type: string, value: number): string => {
  switch (type) {
    case 'perfect_score':
      return 'Achieved a perfect driver score of 100';
    case 'improvement':
      return `Improved your score by ${value} points`;
    case 'streak':
      return `Drove safely for ${value} consecutive days`;
    case 'recovery':
      return `Recovered your score above ${value} points`;
    default:
      return 'Completed a driving milestone';
  }
};

export const Milestones: React.FC<MilestonesProps> = ({
  milestones,
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

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Achievements
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No achievements yet. Keep driving safely to unlock milestones!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Achievements
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          {milestones.map((milestone, index) => (
            <Box key={index}>
              <Box
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{ flexShrink: 0 }}>
                  {getMilestoneIcon(milestone.milestoneType)}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getMilestoneTitle(milestone.milestoneType, milestone.milestoneValue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {getMilestoneDescription(milestone.milestoneType, milestone.milestoneValue)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(milestone.achievedAt), 'MMMM d, yyyy')}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};