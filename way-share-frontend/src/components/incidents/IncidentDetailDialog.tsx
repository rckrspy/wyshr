import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Description as DescriptionIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { 
  useGetIncidentQuery, 
  useMarkIncidentViewedMutation,
  useUpdateIncidentNoteMutation,
} from '../../store/api/incidentApiSlice';
import { DisputeDialog } from './DisputeDialog';

interface IncidentDetailDialogProps {
  incidentId: string;
  open: boolean;
  onClose: () => void;
}

export const IncidentDetailDialog = ({ incidentId, open, onClose }: IncidentDetailDialogProps) => {
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);

  const { data, isLoading, error } = useGetIncidentQuery(incidentId);
  const [markViewed] = useMarkIncidentViewedMutation();
  const [updateNote, { isLoading: isUpdatingNote }] = useUpdateIncidentNoteMutation();

  const incident = data;

  useEffect(() => {
    if (incident && !incident.owner_viewed_at) {
      markViewed(incidentId);
    }
  }, [incident, incidentId, markViewed]);

  useEffect(() => {
    if (incident?.owner_notes) {
      setNotes(incident.owner_notes);
    }
  }, [incident]);

  const handleSaveNotes = async () => {
    try {
      await updateNote({ id: incidentId, data: { note: notes } }).unwrap();
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const formatIncidentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !incident) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Failed to load incident details. Please try again.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">
              {formatIncidentType(incident.incident_type)} Incident
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <Box mb={2}>
            <Chip
              label={incident.incident_status}
              color={incident.incident_status === 'active' ? 'primary' : 
                     incident.incident_status === 'disputed' ? 'warning' : 'success'}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="h6" gutterBottom>
              Vehicle: {incident.license_plate_plaintext} ({incident.state})
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <TimeIcon color="action" />
              <Typography variant="body1">
                {format(new Date(incident.created_at), 'PPpp')}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              <LocationIcon color="action" />
              <Typography variant="body1">
                Approximate location: {incident.location_lat.toFixed(3)}, {incident.location_lng.toFixed(3)}
              </Typography>
            </Box>

            {incident.description && (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <DescriptionIcon color="action" />
                  <Typography variant="subtitle2">Reporter's Description:</Typography>
                </Box>
                <Typography variant="body2" sx={{ pl: 4 }}>
                  {incident.description}
                </Typography>
              </Box>
            )}

            {incident.media_urls && incident.media_urls.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Evidence Photos:
                </Typography>
                <ImageList sx={{ width: '100%', height: 200 }} cols={3} rowHeight={164}>
                  {incident.media_urls.map((url: string, index: number) => (
                    <ImageListItem key={index}>
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        loading="lazy"
                        style={{ cursor: 'pointer' }}
                        onClick={() => window.open(url, '_blank')}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Your Notes
            </Typography>
            {isEditingNotes ? (
              <Box>
                <TextField
                  multiline
                  rows={3}
                  fullWidth
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or context about this incident..."
                  disabled={isUpdatingNote}
                />
                <Box mt={1} display="flex" gap={1}>
                  <Button
                    size="small"
                    onClick={handleSaveNotes}
                    disabled={isUpdatingNote}
                  >
                    Save
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setNotes(incident.owner_notes || '');
                      setIsEditingNotes(false);
                    }}
                    disabled={isUpdatingNote}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                {notes ? (
                  <Typography variant="body2" onClick={() => setIsEditingNotes(true)} sx={{ cursor: 'pointer' }}>
                    {notes}
                  </Typography>
                ) : (
                  <Button
                    size="small"
                    onClick={() => setIsEditingNotes(true)}
                  >
                    Add Notes
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={() => setDisputeDialogOpen(true)}
            startIcon={<ReportIcon />}
            color="warning"
            disabled={incident.incident_status === 'disputed'}
          >
            {incident.incident_status === 'disputed' ? 'Dispute Filed' : 'File Dispute'}
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <DisputeDialog
        incidentId={incidentId}
        open={disputeDialogOpen}
        onClose={() => setDisputeDialogOpen(false)}
      />
    </>
  );
};