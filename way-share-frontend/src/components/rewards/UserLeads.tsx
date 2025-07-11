import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useGetUserLeadsQuery } from '../../store/api/rewardsApiSlice';
import { format } from 'date-fns';

const StatusChip = styled(Chip)<{ status: string }>(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'contacted':
        return theme.palette.info.main;
      case 'converted':
        return theme.palette.success.main;
      case 'expired':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return {
    backgroundColor: getStatusColor(),
    color: 'white',
    fontWeight: 'bold',
  };
});

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  '& .MuiTableHead-root': {
    backgroundColor: theme.palette.grey[50],
  },
}));

const UserLeads: React.FC = () => {
  const { data: leadsData, isLoading, error } = useGetUserLeadsQuery();

  const leads = leadsData?.data || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ScheduleIcon />;
      case 'contacted':
        return <EmailIcon />;
      case 'converted':
        return <CheckCircleIcon />;
      case 'expired':
        return <ErrorIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'contacted':
        return 'Partner Contacted';
      case 'converted':
        return 'Successfully Converted';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const getContactIcon = (method: string) => {
    return method === 'email' ? <EmailIcon /> : <PhoneIcon />;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} minHeight={0}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Failed to load your quote requests. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Quote Requests
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Track the status of your reward partner quote requests and communications.
      </Typography>

      {leads.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          You haven't requested any quotes yet. Visit the Rewards Marketplace to get started!
        </Alert>
      ) : (
        <StyledTableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Partner</TableCell>
                <TableCell>Contact Method</TableCell>
                <TableCell>Score When Applied</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date Requested</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {lead.partner_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Tooltip title={`Contact via ${lead.contact_method}`}>
                        <IconButton size="small">
                          {getContactIcon(lead.contact_method)}
                        </IconButton>
                      </Tooltip>
                      <Typography variant="body2" color="text.secondary">
                        {lead.contact_method === 'email' ? lead.contact_email : lead.contact_phone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={lead.driver_score}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      icon={getStatusIcon(lead.status)}
                      label={getStatusLabel(lead.status)}
                      size="small"
                      status={lead.status}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {lead.notes || 'No additional notes'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledTableContainer>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quote Request Status Guide
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ScheduleIcon color="warning" />
                  <Typography variant="body2" fontWeight="medium">
                    Pending Review
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Your request is being reviewed by the partner.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <EmailIcon color="info" />
                  <Typography variant="body2" fontWeight="medium">
                    Partner Contacted
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  The partner has reached out to you directly.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" fontWeight="medium">
                    Successfully Converted
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  You've successfully engaged with the partner.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ErrorIcon color="error" />
                  <Typography variant="body2" fontWeight="medium">
                    Expired
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  The request has expired without conversion.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default UserLeads;