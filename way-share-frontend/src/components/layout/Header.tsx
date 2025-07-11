import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Report as ReportIcon,
  Map as MapIcon,
  Info as InfoIcon,
  AccountCircle as AccountCircleIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { useLogoutMutation } from '../../store/api/authApiSlice';
import { logout } from '../../store/slices/authSlice';
import { useResponsive } from '../../hooks/useResponsive';
import { typography } from '../../styles/designTokens';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const { isMobile } = useResponsive();
  const dispatch = useAppDispatch();
  const isOnline = useAppSelector((state) => state.session.isOnline);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const [logoutMutation] = useLogoutMutation();

  const navItems = [
    { label: 'Report', path: '/report', icon: <ReportIcon /> },
    { label: 'Map', path: '/map', icon: <MapIcon /> },
    { label: 'About', path: '/about', icon: <InfoIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      dispatch(logout());
    }
  };

  const drawer = (
    <Box sx={{ textAlign: 'center' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: theme.customSpacing.md }}>
        <IconButton 
          onClick={handleDrawerToggle}
          aria-label="Close navigation menu"
          sx={{ 
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography 
        variant="h6" 
        sx={{ 
          my: theme.customSpacing.lg,
          fontSize: { xs: typography.fontSizes.lg, md: typography.fontSizes.xl },
          fontWeight: typography.fontWeights.bold,
        }}
      >
        Way-Share
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={RouterLink}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={handleDrawerToggle}
              sx={{
                minHeight: '48px',
                py: theme.customSpacing.sm,
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: '2px',
                },
              }}
            >
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: typography.fontSizes.base,
                  fontWeight: typography.fontWeights.medium,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
        
        <ListItem divider sx={{ mt: theme.spacing(2) }} />
        
        {isAuthenticated ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/user/profile"
                onClick={handleDrawerToggle}
              >
                <ListItemText 
                  primary="My Profile" 
                  secondary={user?.email}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/user/vehicles"
                onClick={handleDrawerToggle}
              >
                <ListItemText primary="My Vehicles" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/user/incidents"
                onClick={handleDrawerToggle}
              >
                <ListItemText primary="My Incidents" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={RouterLink}
                to="/user/driver-score"
                onClick={handleDrawerToggle}
              >
                <ListItemText primary="Driver Score" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton
              component={RouterLink}
              to="/auth/login"
              onClick={handleDrawerToggle}
            >
              <ListItemText primary="Sign In" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="Open navigation menu"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: theme.customSpacing.md,
                minWidth: '44px',
                minHeight: '44px',
                '&:focus-visible': {
                  outline: `2px solid ${theme.palette.primary.contrastText}`,
                  outlineOffset: '2px',
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit',
              fontSize: { xs: typography.fontSizes.lg, md: typography.fontSizes.xl },
              fontWeight: typography.fontWeights.bold,
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.contrastText}`,
                outlineOffset: '2px',
              },
            }}
          >
            Way-Share
          </Typography>

          {!isOnline && (
            <Chip
              label="Offline"
              color="warning"
              size="small"
              sx={{ mr: theme.customSpacing.md }}
            />
          )}

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: theme.customSpacing.sm, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    minHeight: '44px',
                    px: theme.customSpacing.md,
                    color: location.pathname === item.path ? theme.palette.primary.contrastText : 'inherit',
                    bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.2)' : 'transparent',
                    fontWeight: location.pathname === item.path ? typography.fontWeights.semibold : typography.fontWeights.medium,
                    fontSize: typography.fontSizes.base,
                    '&:hover': {
                      bgcolor: location.pathname === item.path ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                    },
                    '&:focus-visible': {
                      outline: `2px solid ${theme.palette.primary.contrastText}`,
                      outlineOffset: '2px',
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Button
                    component={RouterLink}
                    to="/user/vehicles"
                    color="inherit"
                    sx={{ ml: theme.spacing(1) }}
                  >
                    Vehicles
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/user/incidents"
                    color="inherit"
                    sx={{ ml: theme.spacing(1) }}
                  >
                    Incidents
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/user/driver-score"
                    color="inherit"
                    sx={{ ml: theme.spacing(1) }}
                  >
                    Score
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/user/profile"
                    color="inherit"
                    startIcon={<AccountCircleIcon />}
                    sx={{ ml: theme.spacing(2) }}
                  >
                    {user?.email}
                  </Button>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    variant="outlined"
                    sx={{ 
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        borderColor: theme.palette.primary.contrastText,
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to="/auth/login"
                  color="inherit"
                  startIcon={<LoginIcon />}
                  variant="outlined"
                  sx={{ 
                    ml: theme.spacing(2),
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': {
                      borderColor: theme.palette.primary.contrastText,
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;