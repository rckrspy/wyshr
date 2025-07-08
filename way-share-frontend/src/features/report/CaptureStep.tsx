import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Card,
  CardMedia,
  IconButton,
  Alert,
  Grid,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Close as CloseIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { setLicensePlate, setStep, setMedia } from '../../store/slices/reportSlice';
import { showNotification } from '../../store/slices/uiSlice';

const CaptureStep: React.FC = () => {
  const dispatch = useAppDispatch();
  const report = useAppSelector((state) => state.report.currentReport);
  const [licensePlateInput, setLicensePlateInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Load existing license plate from state when component mounts
  useEffect(() => {
    if (report?.licensePlate) {
      setLicensePlateInput(report.licensePlate);
    }
  }, [report?.licensePlate]);

  const handleBack = () => {
    // Save current license plate input to state before going back
    if (licensePlateInput.trim()) {
      dispatch(setLicensePlate(licensePlateInput.trim().toUpperCase()));
    }
    dispatch(setStep('incidentType'));
  };

  const handleManualEntry = () => {
    if (licensePlateInput.trim().length < 2) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Please enter a valid license plate',
        })
      );
      return;
    }

    dispatch(setLicensePlate(licensePlateInput.trim().toUpperCase()));
    if (capturedFile) {
      dispatch(setMedia(capturedFile));
    }
    dispatch(setStep('details'));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        dispatch(
          showNotification({
            type: 'error',
            message: 'File size must be less than 10MB',
          })
        );
        return;
      }

      setCapturedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // TODO: Implement OCR to extract license plate from image
      dispatch(
        showNotification({
          type: 'info',
          message: 'Please enter the license plate manually for now',
        })
      );
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Unable to access camera',
        })
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
            setCapturedFile(file);
            setImagePreview(canvas.toDataURL('image/jpeg'));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setCapturedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Capture License Plate
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Take a photo or enter the license plate manually. All data is anonymized.
      </Typography>

      <Stack spacing={3}>
        {/* Camera/Image Preview */}
        {!imagePreview && !isCameraActive && (
          <Box sx={{ textAlign: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<CameraIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Take Photo
              </Button>
              <Button
                variant="outlined"
                startIcon={<CameraIcon />}
                onClick={startCamera}
              >
                Use Camera
              </Button>
            </Stack>
          </Box>
        )}

        {/* Camera View */}
        {isCameraActive && (
          <Card>
            <Box sx={{ position: 'relative' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', height: 'auto' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <Button
                  variant="contained"
                  onClick={capturePhoto}
                  sx={{ mr: 2 }}
                >
                  Capture
                </Button>
                <Button variant="outlined" onClick={stopCamera}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Card>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <Card>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={imagePreview}
                alt="Captured license plate"
                sx={{ maxHeight: 300, objectFit: 'contain' }}
              />
              <IconButton
                onClick={clearImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'background.paper',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Card>
        )}

        {/* Manual Entry */}
        <Box>
          <TextField
            fullWidth
            label="License Plate"
            value={licensePlateInput}
            onChange={(e) => setLicensePlateInput(e.target.value.toUpperCase())}
            placeholder="Enter license plate"
            helperText="Enter the license plate number (e.g., ABC1234)"
            inputProps={{ maxLength: 10 }}
          />
        </Box>

        <Alert severity="info">
          License plates are immediately anonymized using one-way encryption.
          Original plate numbers cannot be recovered.
        </Alert>

        {/* Navigation Buttons */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<BackIcon />}
              onClick={handleBack}
              fullWidth
            >
              Back
            </Button>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<NextIcon />}
              onClick={handleManualEntry}
              disabled={!licensePlateInput.trim()}
              fullWidth
            >
              Next
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
};

export default CaptureStep;