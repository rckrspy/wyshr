import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Badge,
} from '@mui/material';
import { PageHeader } from '../../components/layout/PageHeader';
import { IncidentList } from '../../components/incidents/IncidentList';
import { NotificationCenter } from '../../components/incidents/NotificationCenter';
import { NotificationPreferences } from '../../components/incidents/NotificationPreferences';
import { useGetUserIncidentsQuery, useGetNotificationsQuery } from '../../store/api/incidentApiSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`incident-tabpanel-${index}`}
      aria-labelledby={`incident-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

export const IncidentManagement = () => {
  const [tabValue, setTabValue] = useState(0);
  const { data: incidentsData, isLoading: incidentsLoading, error: incidentsError } = useGetUserIncidentsQuery({});
  const { data: notificationsData } = useGetNotificationsQuery();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  interface Notification {
    is_read: boolean;
  }

  const unreadNotifications = notificationsData?.notifications?.filter((n: Notification) => !n.is_read).length || 0;

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <PageHeader
        title="Incident Management"
        subtitle="View and manage incidents involving your verified vehicles"
      />

      <Paper sx={{ mt: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="incident management tabs"
        >
          <Tab 
            label="My Incidents" 
            id="incident-tab-0"
            aria-controls="incident-tabpanel-0"
          />
          <Tab 
            label={
              <Badge badgeContent={unreadNotifications} color="error">
                Notifications
              </Badge>
            }
            id="incident-tab-1"
            aria-controls="incident-tabpanel-1"
          />
          <Tab 
            label="Preferences" 
            id="incident-tab-2"
            aria-controls="incident-tabpanel-2"
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tabValue} index={0}>
            {incidentsLoading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : incidentsError ? (
              <Alert severity="error">
                Failed to load incidents. Please try again later.
              </Alert>
            ) : incidentsData?.incidents.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" gutterBottom>
                  No incidents reported
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When incidents are reported involving your verified vehicles, they will appear here.
                </Typography>
              </Box>
            ) : (
              <IncidentList 
                incidents={incidentsData?.incidents || []}
                stats={incidentsData?.stats}
              />
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <NotificationCenter />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <NotificationPreferences />
          </TabPanel>
        </Box>
      </Paper>
      </Box>
    </Container>
  );
};