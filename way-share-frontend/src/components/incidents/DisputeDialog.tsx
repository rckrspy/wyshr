import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useCreateDisputeMutation } from '../../store/api/incidentApiSlice';

interface DisputeDialogProps {
  incidentId: string;
  open: boolean;
  onClose: () => void;
}

const disputeTypes = [
  { value: 'not_me', label: 'I was not driving at this time' },
  { value: 'incorrect_details', label: 'The details are incorrect' },
  { value: 'wrong_vehicle', label: 'This is not my vehicle' },
  { value: 'false_report', label: 'This is a false report' },
  { value: 'other', label: 'Other reason' },
];

export const DisputeDialog = ({ incidentId, open, onClose }: DisputeDialogProps) => {
  const [disputeType, setDisputeType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [supportingEvidenceUrls, setSupportingEvidenceUrls] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const [createDispute, { isLoading, error }] = useCreateDisputeMutation();

  const handleSubmit = async () => {
    if (!disputeType || !description.trim()) {
      return;
    }

    try {
      await createDispute({
        id: incidentId,
        data: {
          disputeType: disputeType as 'not_me' | 'incorrect_details' | 'wrong_vehicle' | 'false_report' | 'other',
          description: description.trim(),
          supportingEvidenceUrls: supportingEvidenceUrls.filter(url => url.trim()),
        },
      }).unwrap();
      
      // Reset form and close
      setDisputeType('');
      setDescription('');
      setSupportingEvidenceUrls([]);
      onClose();
    } catch (error) {
      console.error('Failed to create dispute:', error);
    }
  };

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setSupportingEvidenceUrls([...supportingEvidenceUrls, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setSupportingEvidenceUrls(supportingEvidenceUrls.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>File a Dispute</DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          If you believe this incident report is incorrect or unfair, you can file a dispute.
          Please provide as much detail as possible.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            Failed to submit dispute. Please try again.
          </Alert>
        )}

        <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
          <FormLabel component="legend">Reason for dispute</FormLabel>
          <RadioGroup
            value={disputeType}
            onChange={(e) => setDisputeType(e.target.value)}
          >
            {disputeTypes.map((type) => (
              <FormControlLabel
                key={type.value}
                value={type.value}
                control={<Radio />}
                label={type.label}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Detailed explanation"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
          required
          helperText="Please provide specific details about why you are disputing this incident"
        />

        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Supporting Evidence (optional)
          </Typography>
          <Box display="flex" gap={1} mb={1}>
            <TextField
              fullWidth
              size="small"
              label="Evidence URL"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://example.com/evidence.jpg"
            />
            <Button onClick={handleAddEvidence} disabled={!evidenceUrl.trim()}>
              Add
            </Button>
          </Box>
          {supportingEvidenceUrls.map((url, index) => (
            <Box key={index} display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {url}
              </Typography>
              <Button size="small" onClick={() => handleRemoveEvidence(index)}>
                Remove
              </Button>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!disputeType || !description.trim() || isLoading}
        >
          Submit Dispute
        </Button>
      </DialogActions>
    </Dialog>
  );
};