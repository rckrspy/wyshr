import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Typography,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  Schedule,
  CheckCircle,
  Cancel,
  Person,
} from '@mui/icons-material';

interface IdentityVerification {
  id: string;
  userId: string;
  userEmail: string;
  stripeVerificationId: string;
  status: 'pending' | 'verified' | 'failed';
  verifiedName?: string;
  submittedAt: string;
  requiresReview: boolean;
}

export const IdentityVerificationList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading] = useState(false);

  // Mock data - in real app, this would come from API
  const verifications: IdentityVerification[] = [
    {
      id: '1',
      userId: 'user-1',
      userEmail: 'john.doe@example.com',
      stripeVerificationId: 'vs_1234567890',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      requiresReview: true,
    },
    {
      id: '2',
      userId: 'user-2',
      userEmail: 'jane.smith@example.com',
      stripeVerificationId: 'vs_0987654321',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      requiresReview: false,
    },
    {
      id: '3',
      userId: 'user-3',
      userEmail: 'bob.johnson@example.com',
      stripeVerificationId: 'vs_1122334455',
      status: 'verified',
      verifiedName: 'Bob Johnson',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      requiresReview: false,
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Cancel color="error" />;
      default:
        return <Schedule color="warning" />;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getTimeSinceSubmission = (submittedAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(submittedAt).getTime()) / 1000 / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const pendingVerifications = verifications.filter(v => v.status === 'pending');

  if (pendingVerifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="text.secondary">
          No pending identity verifications
        </Typography>
      </Box>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Status</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Stripe ID</TableCell>
              <TableCell>Review Required</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingVerifications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((verification) => (
                <TableRow key={verification.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(verification.status)}
                      <Chip
                        label={verification.status}
                        color={getStatusColor(verification.status)}
                        size="small"
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <Person fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2">
                          {verification.userEmail}
                        </Typography>
                        {verification.verifiedName && (
                          <Typography variant="caption" color="text.secondary">
                            {verification.verifiedName}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {verification.stripeVerificationId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {verification.requiresReview ? (
                      <Chip
                        label="Manual Review"
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label="Automated"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTimeSinceSubmission(verification.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Review in Stripe Dashboard">
                      <IconButton
                        onClick={() => {
                          // In real app, this would open Stripe dashboard
                          window.open(
                            `https://dashboard.stripe.com/identity/verification-sessions/${verification.stripeVerificationId}`,
                            '_blank'
                          );
                        }}
                        size="small"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={pendingVerifications.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};