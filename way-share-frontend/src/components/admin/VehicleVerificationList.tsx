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
} from '@mui/material';
import {
  Visibility,
  Schedule,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface VehicleVerification {
  id: string;
  userId: string;
  userEmail: string;
  licensePlate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  documentType: string;
  extractionConfidence: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const VehicleVerificationList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading] = useState(false);

  // Mock data - in real app, this would come from API
  const verifications: VehicleVerification[] = [
    {
      id: '1',
      userId: 'user-1',
      userEmail: 'john.doe@example.com',
      licensePlate: 'ABC123',
      state: 'CA',
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      documentType: 'insurance',
      extractionConfidence: 0.92,
      submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      userId: 'user-2',
      userEmail: 'jane.smith@example.com',
      licensePlate: 'XYZ789',
      state: 'NY',
      make: 'Honda',
      model: 'Civic',
      year: 2019,
      documentType: 'registration',
      extractionConfidence: 0.78,
      submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      status: 'pending',
    },
    {
      id: '3',
      userId: 'user-3',
      userEmail: 'bob.johnson@example.com',
      licensePlate: 'DEF456',
      state: 'TX',
      make: 'Ford',
      model: 'F-150',
      year: 2021,
      documentType: 'insurance',
      extractionConfidence: 0.95,
      submittedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      status: 'pending',
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getConfidenceColor = (confidence: number): 'success' | 'warning' | 'error' => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle color="success" />;
      case 'rejected':
        return <Cancel color="error" />;
      default:
        return <Schedule color="warning" />;
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

  if (verifications.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="text.secondary">
          No pending verifications
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
              <TableCell>Vehicle</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>Confidence</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {verifications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((verification) => (
                <TableRow key={verification.id} hover>
                  <TableCell>
                    <Tooltip title={verification.status}>
                      {getStatusIcon(verification.status)}
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {verification.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {verification.licensePlate} ({verification.state})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {verification.year} {verification.make} {verification.model}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={verification.documentType.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${(verification.extractionConfidence * 100).toFixed(0)}%`}
                      color={getConfidenceColor(verification.extractionConfidence)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTimeSinceSubmission(verification.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Review">
                      <IconButton
                        onClick={() => navigate(`/admin/verifications/vehicle/${verification.id}`)}
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
        count={verifications.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};