import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { hideNotification } from '../../store/slices/uiSlice';

const NotificationSnackbar: React.FC = () => {
  const notification = useAppSelector((state) => state.ui.notification);
  const dispatch = useAppDispatch();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideNotification());
  };

  return (
    <Snackbar
      open={!!notification}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      {notification ? (
        <Alert
          onClose={handleClose}
          severity={notification.type}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      ) : <div />}
    </Snackbar>
  );
};

export default NotificationSnackbar;