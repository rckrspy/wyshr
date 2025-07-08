import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Map as MapIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { clearReport } from '../../store/slices/reportSlice';

const SuccessStep: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.session.isOnline);
  const pendingReports = useAppSelector((state) => state.session.pendingReports);

  const handleNewReport = () => {
    dispatch(clearReport());
    navigate('/report');
  };

  const handleViewMap = () => {
    dispatch(clearReport());
    navigate('/map');
  };

  const handleGoHome = () => {
    dispatch(clearReport());
    navigate('/');
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      <CheckCircleIcon
        sx={{
          fontSize: 80,
          color: 'success.main',
          mb: 2,
        }}
      />

      <Typography variant="h4" gutterBottom>
        Report Submitted Successfully!
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Thank you for helping make San Jose roads safer. Your report has been
        {isOnline ? ' submitted' : ' saved'} and will contribute to our traffic safety data.
      </Typography>

      {!isOnline && pendingReports.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {pendingReports.length} pending report{pendingReports.length > 1 ? 's' : ''} that
          will be submitted when you're back online.
        </Alert>
      )}

      <Card sx={{ mb: 3, textAlign: 'left' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            What happens next?
          </Typography>
          <Typography variant="body2" paragraph>
            • Your report is anonymized and added to our database
          </Typography>
          <Typography variant="body2" paragraph>
            • The incident location appears on the public heat map
          </Typography>
          <Typography variant="body2" paragraph>
            • Aggregated data helps identify problem areas
          </Typography>
          <Typography variant="body2">
            • Community awareness promotes safer driving habits
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleNewReport}
          fullWidth
        >
          Submit Another Report
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<MapIcon />}
          onClick={handleViewMap}
          fullWidth
        >
          View Heat Map
        </Button>
        <Button
          variant="text"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          fullWidth
        >
          Return to Home
        </Button>
      </Stack>
    </Box>
  );
};

export default SuccessStep;