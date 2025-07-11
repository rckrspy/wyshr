import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ArrowBack,
  Description,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';

interface VehicleVerification {
  id: string;
  vehicleId: string;
  userId: string;
  userEmail: string;
  licensePlate: string;
  state: string;
  make?: string;
  model?: string;
  year?: number;
  documentType: string;
  documentUrl: string;
  extractedName: string;
  extractionConfidence: number;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const VehicleVerificationReview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);

  // Mock data - in real app, this would come from API
  const verification: VehicleVerification = {
    id: id || '1',
    vehicleId: 'vehicle-123',
    userId: 'user-456',
    userEmail: 'john.doe@example.com',
    licensePlate: 'ABC123',
    state: 'CA',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    documentType: 'insurance',
    documentUrl: '/mock-document.jpg',
    extractedName: 'John Doe',
    extractionConfidence: 0.92,
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      // API call to approve verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to approve verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      // API call to reject verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to reject verification:', error);
    } finally {
      setLoading(false);
      setShowRejectDialog(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'success';
    if (confidence >= 0.7) return 'warning';
    return 'error';
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Box>

      <PageHeader
        title="Vehicle Verification Review"
        subtitle={`Review verification for ${verification.licensePlate}`}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Document Preview */}
        <Box sx={{ flex: '1 1 45%', minWidth: { xs: '100%', md: '45%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Submitted Document
            </Typography>
            
            <Box
              sx={{
                bgcolor: 'grey.100',
                height: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1,
                mb: 2,
                cursor: 'pointer',
              }}
              onClick={() => setShowDocumentPreview(true)}
            >
              <Box textAlign="center">
                <Description sx={{ fontSize: 64, color: 'grey.500', mb: 1 }} />
                <Typography color="text.secondary">
                  Click to view document
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary">
              Document Type: <strong>{verification.documentType.toUpperCase()}</strong>
            </Typography>
          </Paper>
        </Box>

        {/* Right Column - Verification Details */}
        <Box sx={{ flex: '1 1 45%', minWidth: { xs: '100%', md: '45%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Vehicle Information
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="License Plate"
                  secondary={`${verification.licensePlate} (${verification.state})`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Vehicle"
                  secondary={`${verification.year} ${verification.make} ${verification.model}`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="User"
                  secondary={verification.userEmail}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Submitted"
                  secondary={new Date(verification.submittedAt).toLocaleString()}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              OCR Extraction Results
            </Typography>
            
            <Alert 
              severity={verification.extractionConfidence >= 0.7 ? 'success' : 'warning'}
              sx={{ mb: 2 }}
            >
              Confidence Score: {(verification.extractionConfidence * 100).toFixed(0)}%
            </Alert>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Extracted Name:
            </Typography>
            <Typography variant="h6" gutterBottom>
              {verification.extractedName}
            </Typography>

            <Chip
              label={verification.extractionConfidence >= 0.9 ? 'High Confidence' : 'Manual Review Recommended'}
              color={getConfidenceColor(verification.extractionConfidence)}
              size="small"
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleApprove}
                disabled={loading}
                fullWidth
              >
                Approve Verification
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={() => setShowRejectDialog(true)}
                disabled={loading}
                fullWidth
              >
                Reject Verification
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onClose={() => setShowRejectDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reject Verification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectDialog(false)}>Cancel</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!rejectReason.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm Rejection'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Preview Dialog */}
      <Dialog
        open={showDocumentPreview}
        onClose={() => setShowDocumentPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              height: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
            }}
          >
            <Typography color="text.secondary">
              Document preview would be displayed here
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDocumentPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};