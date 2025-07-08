import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as InstallIcon,
  PhoneIphone as MobileIcon,
} from '@mui/icons-material';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('wayshare_install_dismissed');
    if (dismissed === 'true') {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPromptEvent(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay (user has used the app for a bit)
      setTimeout(() => {
        setShowPrompt(true);
      }, 30000); // 30 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPromptEvent) return;

    installPromptEvent.prompt();
    const { outcome } = await installPromptEvent.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPromptEvent(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('wayshare_install_dismissed', 'true');
    setShowPrompt(false);
  };

  const handleClose = () => {
    setShowPrompt(false);
    // Show again after 7 days
    setTimeout(() => {
      const dismissed = localStorage.getItem('wayshare_install_dismissed');
      if (dismissed !== 'true') {
        setShowPrompt(true);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  };

  if (isInstalled || !showPrompt || !installPromptEvent) {
    return null;
  }

  return (
    <Dialog
      open={showPrompt}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Install Way-Share</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <MobileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="body1" paragraph>
            Install Way-Share on your device for quick access and offline functionality.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Works offline
            <br />
            • Quick access from home screen
            <br />
            • Native app experience
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDismiss} color="inherit">
          Not Now
        </Button>
        <Button
          onClick={handleInstall}
          variant="contained"
          startIcon={<InstallIcon />}
        >
          Install
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstallPrompt;