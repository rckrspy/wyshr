import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DirectionsCar as CarIcon,
  Report as ReportIcon,
  CheckCircle as CheckCircleIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '../../store/api/incidentApiSlice';

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export const NotificationCenter = () => {
  const { data, isLoading, error } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = (data?.notifications || []) as Notification[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident_reported':
        return <CarIcon color="error" />;
      case 'dispute_resolved':
      case 'dispute_rejected':
        return <ReportIcon color="warning" />;
      case 'vehicle_verified':
        return <CheckCircleIcon color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        Failed to load notifications. Please try again later.
      </Alert>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No notifications
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You'll receive notifications here when incidents are reported involving your vehicles.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {unreadCount > 0 && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Typography>
          <Button
            size="small"
            startIcon={<MarkReadIcon />}
            onClick={handleMarkAllRead}
          >
            Mark all as read
          </Button>
        </Box>
      )}

      <List sx={{ p: 0 }}>
        {notifications.map((notification, index) => (
          <Box key={notification.id}>
            <ListItem
              component={Paper}
              elevation={notification.is_read ? 0 : 1}
              sx={{
                mb: 1,
                bgcolor: notification.is_read ? 'background.paper' : 'action.hover',
                position: 'relative',
                pr: notification.is_read ? 2 : 8,
              }}
            >
              <ListItemIcon>
                {getNotificationIcon(notification.type)}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant="body2" color="text.secondary">
                      {notification.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(notification.created_at), 'PPp')}
                    </Typography>
                  </>
                }
              />
              {!notification.is_read && (
                <IconButton
                  size="small"
                  onClick={() => handleMarkRead(notification.id)}
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  <MarkReadIcon />
                </IconButton>
              )}
            </ListItem>
            {index < notifications.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Box>
  );
};