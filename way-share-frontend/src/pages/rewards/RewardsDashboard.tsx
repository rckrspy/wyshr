import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Storefront as StorefrontIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import RewardsMarketplace from '../../components/rewards/RewardsMarketplace';
import UserLeads from '../../components/rewards/UserLeads';
import { useGetDriverScoreQuery } from '../../store/api/driverScoreApiSlice';
import { useGetRewardsStatsQuery } from '../../store/api/rewardsApiSlice';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    minHeight: 48,
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: 500,
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ScoreDisplay = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(2),
}));

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
      id={`rewards-tabpanel-${index}`}
      aria-labelledby={`rewards-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const RewardsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const { data: driverScoreData } = useGetDriverScoreQuery();
  const { data: rewardsStats } = useGetRewardsStatsQuery();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const currentScore = driverScoreData?.currentScore || 0;
  const stats = rewardsStats?.data;

  const getScoreCategory = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'success' as const };
    if (score >= 80) return { label: 'Good', color: 'primary' as const };
    if (score >= 70) return { label: 'Fair', color: 'warning' as const };
    return { label: 'Needs Improvement', color: 'error' as const };
  };

  const scoreCategory = getScoreCategory(currentScore);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rewards Dashboard
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Manage your reward partnerships and track your eligibility for exclusive benefits.
      </Typography>

      {/* Driver Score Overview */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <StarIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Your Driver Score
                </Typography>
              </Box>
              <ScoreDisplay>
                <Typography variant="h2" component="div" fontWeight="bold">
                  {currentScore}
                </Typography>
                <Chip
                  label={scoreCategory.label}
                  color={scoreCategory.color}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </ScoreDisplay>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Higher scores unlock better rewards and discounts
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <StorefrontIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Available Partners
                </Typography>
              </Box>
              <Typography variant="h2" component="div" fontWeight="bold" color="primary.main">
                {stats?.active_partners || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active reward partners ready to offer you benefits
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <StatsCard>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Conversion Rate
                </Typography>
              </Box>
              <Typography variant="h2" component="div" fontWeight="bold" color="success.main">
                {stats?.conversion_rate?.toFixed(1) || 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average success rate for quote requests
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Score-based Eligibility Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Eligibility Requirements:</strong> Most partners require a minimum score of 70-85. 
          Keep improving your driving score to unlock more premium rewards!
        </Typography>
      </Alert>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <StyledTabs value={tabValue} onChange={handleTabChange}>
          <Tab
            icon={<StorefrontIcon />}
            iconPosition="start"
            label="Browse Partners"
          />
          <Tab
            icon={<AssignmentIcon />}
            iconPosition="start"
            label="My Quote Requests"
          />
        </StyledTabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={tabValue} index={0}>
        <RewardsMarketplace />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <UserLeads />
      </TabPanel>
    </Container>
  );
};

export default RewardsDashboard;