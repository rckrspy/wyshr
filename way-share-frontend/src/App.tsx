import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { useAppDispatch } from './hooks/redux';
import { setOnlineStatus } from './store/slices/sessionSlice';
import theme from './styles/theme';
import { offlineService } from './services/offlineService';
import { authService } from './services/authService';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

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

// Auth pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// User pages
import { UserProfilePage } from './pages/user/UserProfilePage';
import { VehicleManagement } from './pages/user/VehicleManagement';
import { IncidentManagement } from './pages/user/IncidentManagement';
import { DriverScorePage } from './pages/user/DriverScorePage';

// Identity pages
import { IdentityVerificationSuccessPage } from './pages/identity/IdentityVerificationSuccessPage';
import { IdentityVerificationRefreshPage } from './pages/identity/IdentityVerificationRefreshPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { VehicleVerificationReview } from './pages/admin/VehicleVerificationReview';
import { DisputeReview } from './pages/admin/DisputeReview';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize services
    offlineService.init();
    authService.init();

    // Handle online/offline status
    const handleOnline = () => dispatch(setOnlineStatus(true));
    const handleOffline = () => dispatch(setOnlineStatus(false));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      offlineService.destroy();
      authService.destroy();
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
              
              {/* Auth Pages */}
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
              <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
              <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />
              
              {/* User Pages */}
              <Route path="/user/profile" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
              <Route path="/user/vehicles" element={<ProtectedRoute><VehicleManagement /></ProtectedRoute>} />
              <Route path="/user/incidents" element={<ProtectedRoute><IncidentManagement /></ProtectedRoute>} />
              <Route path="/user/driver-score" element={<ProtectedRoute requireVerified><DriverScorePage /></ProtectedRoute>} />
              
              {/* Identity Pages */}
              <Route path="/identity/success" element={<IdentityVerificationSuccessPage />} />
              <Route path="/identity/refresh" element={<IdentityVerificationRefreshPage />} />
              
              {/* Admin Pages */}
              <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/verifications/vehicle/:id" element={<ProtectedRoute requireAdmin><VehicleVerificationReview /></ProtectedRoute>} />
              <Route path="/admin/disputes/:id" element={<ProtectedRoute requireAdmin><DisputeReview /></ProtectedRoute>} />
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