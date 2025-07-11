import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  useSubmitVerificationMutation,
  useGetVehicleVerificationsQuery,
} from '../../store/api/vehicleApiSlice';
import { useAppDispatch } from '../../hooks/redux';
import { showNotification } from '../../store/slices/uiSlice';
import type { VehicleVerification } from '../../store/api/vehicleApiSlice';

interface VehicleVerificationDialogProps {
  open: boolean;
  onClose: () => void;
  vehicleId: string;
  vehicleDisplay: string;
}

const DOCUMENT_TYPES = [
  { value: 'registration', label: 'Vehicle Registration' },
  { value: 'insurance', label: 'Insurance Card' },
  { value: 'title', label: 'Vehicle Title' },
];

export const VehicleVerificationDialog: React.FC<VehicleVerificationDialogProps> = ({
  open,
  onClose,
  vehicleId,
  vehicleDisplay,
}) => {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState('registration');
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: verifications, refetch } = useGetVehicleVerificationsQuery(vehicleId, {
    skip: !open,
  });
  const [submitVerification] = useSubmitVerificationMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        dispatch(showNotification({
          message: 'Please upload a JPEG, PNG, or PDF file',
          type: 'error',
        }));
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        dispatch(showNotification({
          message: 'File size must be less than 10MB',
          type: 'error',
        }));
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('documentType', documentType);

      await submitVerification({
        vehicleId,
        formData,
      }).unwrap();

      dispatch(showNotification({
        message: 'Document uploaded successfully',
        type: 'success',
      }));

      setSelectedFile(null);
      setDocumentType('registration');
      refetch();
    } catch {
      dispatch(showNotification({
        message: 'Failed to upload document',
        type: 'error',
      }));
    } finally {
      setUploading(false);
    }
  };

  const getVerificationStatus = (verification: VehicleVerification) => {
    if (verification.status === 'approved') {
      return <Chip icon={<CheckCircleIcon />} label="Approved" color="success" size="small" />;
    } else if (verification.status === 'rejected') {
      return <Chip icon={<ErrorIcon />} label="Rejected" color="error" size="small" />;
    } else if (verification.requiresManualReview) {
      return <Chip label="Under Review" color="warning" size="small" />;
    } else {
      return <Chip label="Processing" color="default" size="small" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Verify Vehicle
        <Typography variant="body2" color="text.secondary">
          {vehicleDisplay}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload documents that show your name and this vehicle's license plate number.
            Accepted formats: JPEG, PNG, PDF (max 10MB)
          </Alert>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Document Type</InputLabel>
            <Select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              label="Document Type"
            >
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              border: '2px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileSelect}
            />
            <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body1">
              {selectedFile ? selectedFile.name : 'Click to upload document'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or drag and drop
            </Typography>
          </Box>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleUpload}
                disabled={uploading}
                startIcon={<UploadIcon />}
              >
                Upload Document
              </Button>
            </Box>
          )}

          {uploading && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
            </Box>
          )}
        </Box>

        {verifications && verifications.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Uploaded Documents
            </Typography>
            <List>
              {verifications.map((verification) => (
                <ListItem key={verification.id} divider>
                  <ListItemText
                    primary={DOCUMENT_TYPES.find((t) => t.value === verification.documentType)?.label}
                    secondary={
                      <>
                        Uploaded {format(new Date(verification.uploadedAt), 'MMM d, yyyy h:mm a')}
                        {verification.reviewedAt && (
                          <Typography variant="caption" display="block">
                            Reviewed {format(new Date(verification.reviewedAt), 'MMM d, yyyy')}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    {getVerificationStatus(verification)}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};