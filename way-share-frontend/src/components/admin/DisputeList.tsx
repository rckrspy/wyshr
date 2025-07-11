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
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Dispute {
  id: string;
  reportId: string;
  userId: string;
  userEmail: string;
  incidentType: string;
  licensePlate: string;
  disputeType: 'not_me' | 'incorrect_details' | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  submittedAt: string;
  priority: 'low' | 'medium' | 'high';
}

export const DisputeList: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading] = useState(false);

  // Mock data - in real app, this would come from API
  const disputes: Dispute[] = [
    {
      id: '1',
      reportId: 'report-123',
      userId: 'user-1',
      userEmail: 'john.doe@example.com',
      incidentType: 'reckless_driving',
      licensePlate: 'ABC123',
      disputeType: 'not_me',
      description: 'I was not driving at that time. My car was parked at home.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      priority: 'high',
    },
    {
      id: '2',
      reportId: 'report-456',
      userId: 'user-2',
      userEmail: 'jane.smith@example.com',
      incidentType: 'illegal_parking',
      licensePlate: 'XYZ789',
      disputeType: 'incorrect_details',
      description: 'The location is incorrect. I was parked legally in a designated spot.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      priority: 'medium',
    },
    {
      id: '3',
      reportId: 'report-789',
      userId: 'user-3',
      userEmail: 'bob.johnson@example.com',
      incidentType: 'failure_to_signal',
      licensePlate: 'DEF456',
      disputeType: 'other',
      description: 'This report is malicious. The reporter has been harassing me.',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      priority: 'high',
    },
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };



  const getPriorityColor = (priority: string): 'error' | 'warning' | 'info' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
      default:
        return 'info';
    }
  };

  const getDisputeTypeLabel = (type: string) => {
    switch (type) {
      case 'not_me':
        return "Wasn't Me";
      case 'incorrect_details':
        return 'Incorrect Details';
      case 'other':
        return 'Other';
      default:
        return type;
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

  const pendingDisputes = disputes.filter(d => d.status === 'pending');

  if (pendingDisputes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography color="text.secondary">
          No pending disputes
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
              <TableCell>Priority</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Incident</TableCell>
              <TableCell>Dispute Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingDisputes
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((dispute) => (
                <TableRow key={dispute.id} hover>
                  <TableCell>
                    <Chip
                      icon={dispute.priority === 'high' ? <Warning /> : undefined}
                      label={dispute.priority.toUpperCase()}
                      color={getPriorityColor(dispute.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dispute.userEmail}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {dispute.incidentType.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dispute.licensePlate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getDisputeTypeLabel(dispute.disputeType)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {dispute.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {getTimeSinceSubmission(dispute.submittedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Review Dispute">
                      <IconButton
                        onClick={() => navigate(`/admin/disputes/${dispute.id}`)}
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
        count={pendingDisputes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};