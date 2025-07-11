import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Tooltip,
  useTheme,
  Theme,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface DriverScoreCardProps {
  currentScore: number;
  change: number;
  percentile: number;
  loading?: boolean;
}

const ScoreCircle = styled(Box)(() => ({
  position: 'relative',
  width: 200,
  height: 200,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const getScoreColor = (score: number, theme: Theme) => {
  if (score >= 90) return theme.driverScore.excellent;
  if (score >= 80) return theme.driverScore.good;
  if (score >= 60) return theme.driverScore.fair;
  if (score >= 40) return theme.driverScore.poor;
  return theme.driverScore.veryPoor;
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Poor';
  return 'Very Poor';
};

export const DriverScoreCard: React.FC<DriverScoreCardProps> = ({
  currentScore,
  change,
  percentile,
  loading = false,
}) => {
  const theme = useTheme();
  
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp sx={{ color: theme.palette.success.main }} />;
    if (change < 0) return <TrendingDown sx={{ color: theme.palette.error.main }} />;
    return <TrendingFlat sx={{ color: theme.palette.grey[600] }} />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: theme.spacing(4) }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          Your Driver Score
        </Typography>

        <ScoreCircle>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={currentScore}
              size={180}
              thickness={4}
              sx={{
                color: getScoreColor(currentScore, theme),
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h2" component="div" color="text.primary">
                {currentScore}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {getScoreLabel(currentScore)}
              </Typography>
            </Box>
          </Box>
        </ScoreCircle>

        <Box sx={{ mt: theme.spacing(3), textAlign: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: theme.spacing(1), mb: theme.spacing(2) }}>
            {getTrendIcon()}
            <Typography variant="body1" color={change > 0 ? 'success.main' : change < 0 ? 'error.main' : 'text.secondary'}>
              {change > 0 ? '+' : ''}{change} from last update
            </Typography>
          </Box>

          <Tooltip title="You have a better score than this percentage of drivers">
            <Chip
              label={`Better than ${percentile}% of drivers`}
              color={percentile >= 75 ? 'success' : percentile >= 50 ? 'primary' : 'default'}
              variant="outlined"
            />
          </Tooltip>
        </Box>

        <Box sx={{ mt: theme.spacing(3), p: theme.spacing(2), bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Your score is based on reported incidents, dispute resolutions, and time without incidents.
            Drive safely to improve your score!
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};