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
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  ArrowBack,
  Description,
  Image,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader';

interface Dispute {
  id: string;
  reportId: string;
  userId: string;
  userEmail: string;
  incidentType: string;
  incidentDate: string;
  licensePlate: string;
  location: string;
  disputeType: 'not_me' | 'incorrect_details' | 'other';
  description: string;
  supportingEvidenceUrls?: string[];
  status: 'pending' | 'resolved' | 'rejected';
  submittedAt: string;
  originalReportDescription: string;
  reportMediaUrls?: string[];
}

export const DisputeReview: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolutionType, setResolutionType] = useState<'resolve' | 'reject'>('resolve');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string>('');

  // Mock data - in real app, this would come from API
  const dispute: Dispute = {
    id: id || '1',
    reportId: 'report-123',
    userId: 'user-456',
    userEmail: 'john.doe@example.com',
    incidentType: 'reckless_driving',
    incidentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    licensePlate: 'ABC123',
    location: '123 Main St, Anytown, CA',
    disputeType: 'not_me',
    description: 'I was not driving at that time. My car was parked at home. I have security camera footage showing my car in the driveway.',
    supportingEvidenceUrls: ['/evidence1.jpg', '/evidence2.jpg'],
    status: 'pending',
    submittedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    originalReportDescription: 'Vehicle was speeding and weaving through traffic dangerously.',
    reportMediaUrls: ['/report1.jpg', '/report2.jpg'],
  };

  const handleResolve = () => {
    setResolutionType('resolve');
    setShowResolutionDialog(true);
  };

  const handleReject = () => {
    setResolutionType('reject');
    setShowResolutionDialog(true);
  };

  const handleConfirmResolution = async () => {
    if (!resolutionNotes.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      // API call to resolve/reject dispute
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Failed to update dispute:', error);
    } finally {
      setLoading(false);
      setShowResolutionDialog(false);
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
        title="Dispute Review"
        subtitle={`Review dispute for incident #${dispute.reportId}`}
      />

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Left Column - Original Report */}
        <Box sx={{ flex: '1 1 45%', minWidth: { xs: '100%', md: '45%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Original Report Details
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Incident Type"
                  secondary={dispute.incidentType.replace(/_/g, ' ')}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Date & Time"
                  secondary={new Date(dispute.incidentDate).toLocaleString()}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="License Plate"
                  secondary={dispute.licensePlate}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Location"
                  secondary={dispute.location}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={dispute.originalReportDescription}
                />
              </ListItem>
            </List>
          </Paper>

          {dispute.reportMediaUrls && dispute.reportMediaUrls.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Report Evidence
              </Typography>
              <ImageList cols={2} gap={8}>
                {dispute.reportMediaUrls.map((url, index) => (
                  <ImageListItem
                    key={index}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedMedia(url);
                      setShowMediaPreview(true);
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                      }}
                    >
                      <Image sx={{ fontSize: 48, color: 'grey.500' }} />
                    </Box>
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          )}
        </Box>

        {/* Right Column - Dispute Details */}
        <Box sx={{ flex: '1 1 45%', minWidth: { xs: '100%', md: '45%' } }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dispute Information
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Submitted By"
                  secondary={dispute.userEmail}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Dispute Type"
                  secondary={
                    <Chip
                      label={getDisputeTypeLabel(dispute.disputeType)}
                      size="small"
                      color="primary"
                    />
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Submitted"
                  secondary={new Date(dispute.submittedAt).toLocaleString()}
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dispute Description
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {dispute.description}
            </Typography>
          </Paper>

          {dispute.supportingEvidenceUrls && dispute.supportingEvidenceUrls.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Supporting Evidence
              </Typography>
              <ImageList cols={2} gap={8}>
                {dispute.supportingEvidenceUrls.map((url, index) => (
                  <ImageListItem
                    key={index}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => {
                      setSelectedMedia(url);
                      setShowMediaPreview(true);
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: 'grey.100',
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 1,
                      }}
                    >
                      <Description sx={{ fontSize: 48, color: 'grey.500' }} />
                    </Box>
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircle />}
                onClick={handleResolve}
                disabled={loading}
                fullWidth
              >
                Resolve Dispute
              </Button>
              
              <Button
                variant="contained"
                color="error"
                startIcon={<Cancel />}
                onClick={handleReject}
                disabled={loading}
                fullWidth
              >
                Reject Dispute
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Resolution Dialog */}
      <Dialog
        open={showResolutionDialog}
        onClose={() => setShowResolutionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {resolutionType === 'resolve' ? 'Resolve Dispute' : 'Reject Dispute'}
        </DialogTitle>
        <DialogContent>
          <Alert severity={resolutionType === 'resolve' ? 'info' : 'warning'} sx={{ mb: 2 }}>
            {resolutionType === 'resolve'
              ? 'Resolving this dispute will remove the incident from the user\'s record.'
              : 'Rejecting this dispute will maintain the incident on the user\'s record.'}
          </Alert>
          <TextField
            autoFocus
            multiline
            rows={4}
            fullWidth
            label="Resolution Notes"
            value={resolutionNotes}
            onChange={(e) => setResolutionNotes(e.target.value)}
            placeholder="Please provide detailed notes about your decision..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResolutionDialog(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmResolution}
            color={resolutionType === 'resolve' ? 'success' : 'error'}
            variant="contained"
            disabled={!resolutionNotes.trim() || loading}
          >
            {loading ? <CircularProgress size={24} /> : `Confirm ${resolutionType === 'resolve' ? 'Resolution' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Preview Dialog */}
      <Dialog
        open={showMediaPreview}
        onClose={() => setShowMediaPreview(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Media Preview</DialogTitle>
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
              Media preview: {selectedMedia}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMediaPreview(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};