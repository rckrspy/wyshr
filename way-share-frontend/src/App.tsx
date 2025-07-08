import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { useAppDispatch } from './hooks/redux';
import { setOnlineStatus } from './store/slices/sessionSlice';
import theme from './styles/theme';
import { offlineService } from './services/offlineService';

// Layout components
import Layout from './components/layout/Layout';

// Page components
import HomePage from './pages/HomePage';
import ReportPage from './pages/ReportPage';
import MapPage from './pages/MapPage';
import AboutPage from './pages/AboutPage';
import NotificationSnackbar from './components/common/NotificationSnackbar';
import InstallPrompt from './components/common/InstallPrompt';

// Legal pages
import TermsOfServicePage from './pages/legal/TermsOfServicePage';
import PrivacyPolicyPage from './pages/legal/PrivacyPolicyPage';
import DisclaimerPage from './pages/legal/DisclaimerPage';
import AccessibilityPage from './pages/legal/AccessibilityPage';
import CookiePolicyPage from './pages/legal/CookiePolicyPage';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize offline service
    offlineService.init();

    // Handle online/offline status
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineService.destroy();
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Legal Pages */}
              <Route path="/legal/terms" element={<TermsOfServicePage />} />
              <Route path="/legal/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/legal/disclaimer" element={<DisclaimerPage />} />
              <Route path="/legal/accessibility" element={<AccessibilityPage />} />
              <Route path="/legal/cookies" element={<CookiePolicyPage />} />
            </Routes>
          </Layout>
          <NotificationSnackbar />
          <InstallPrompt />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;