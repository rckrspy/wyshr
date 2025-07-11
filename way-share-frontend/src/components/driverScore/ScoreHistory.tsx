import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Warning,
  CheckCircle,
  AccessTime,
  Edit,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { ScoreEvent } from '../../store/api/driverScoreApiSlice';

interface ScoreHistoryProps {
  events: ScoreEvent[];
  loading?: boolean;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'incident_reported':
      return <Warning sx={{ color: '#f44336' }} />;
    case 'dispute_resolved':
      return <CheckCircle sx={{ color: '#4caf50' }} />;
    case 'time_elapsed':
      return <AccessTime sx={{ color: '#2196f3' }} />;
    case 'manual_adjustment':
      return <Edit sx={{ color: '#ff9800' }} />;
    default:
      return <Edit sx={{ color: '#757575' }} />;
  }
};

const getImpactColor = (impact: number) => {
  if (impact > 0) return 'success';
  if (impact < 0) return 'error';
  return 'default';
};

export const ScoreHistory: React.FC<ScoreHistoryProps> = ({
  events,
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

  if (events.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Score History
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No score events yet. Your score will update as you drive.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Score History
        </Typography>
        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {events.map((event, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  {getEventIcon(event.eventType)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {event.description}
                      </Typography>
                      <Chip
                        label={`${event.scoreImpact > 0 ? '+' : ''}${event.scoreImpact}`}
                        color={getImpactColor(event.scoreImpact)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {event.previousScore} → {event.newScore} points
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < events.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};