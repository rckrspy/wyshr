import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Assignment,
  DirectionsCar,
  Person,
  CheckCircle,
  Schedule,
} from '@mui/icons-material';
// Removed unused import: useNavigate
import { PageHeader } from '../../components/layout/PageHeader';
import { IdentityVerificationList } from '../../components/admin/IdentityVerificationList';
import { VehicleVerificationList } from '../../components/admin/VehicleVerificationList';
import { DisputeList } from '../../components/admin/DisputeList';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock statistics - in real app, these would come from API
  const stats = {
    pendingVerifications: 12,
    pendingDisputes: 5,
    completedToday: 23,
    averageReviewTime: '4.2 min',
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage verifications and disputes"
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Pending Verifications
                </Typography>
              </Box>
              <Typography variant="h4">{stats.pendingVerifications}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assignment color="error" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Pending Disputes
                </Typography>
              </Box>
              <Typography variant="h4">{stats.pendingDisputes}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Completed Today
                </Typography>
              </Box>
              <Typography variant="h4">{stats.completedToday}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule color="info" sx={{ mr: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  Avg Review Time
                </Typography>
              </Box>
              <Typography variant="h4">{stats.averageReviewTime}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content Area */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin sections"
          >
            <Tab
              label="Identity Verifications"
              icon={<Person />}
              iconPosition="start"
            />
            <Tab
              label="Vehicle Verifications"
              icon={<DirectionsCar />}
              iconPosition="start"
            />
            <Tab
              label="Disputes"
              icon={<Assignment />}
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Identity Verifications
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Review and approve user identity verifications
            </Typography>
            <IdentityVerificationList />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pending Vehicle Verifications
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Review vehicle ownership documents
            </Typography>
            <VehicleVerificationList />
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Open Disputes
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Review and resolve incident disputes
            </Typography>
            <DisputeList />
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};