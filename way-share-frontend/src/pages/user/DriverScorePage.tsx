import React from 'react';
import {
  Container,
  Box,
  Typography,
  Alert,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { PageHeader } from '../../components/layout/PageHeader';
import { DriverScoreCard } from '../../components/driverScore/DriverScoreCard';
import { ScoreHistory } from '../../components/driverScore/ScoreHistory';
import { ScoreBreakdown } from '../../components/driverScore/ScoreBreakdown';
import { Milestones } from '../../components/driverScore/Milestones';
import {
  useGetDriverScoreQuery,
  useGetScoreHistoryQuery,
  useGetScoreBreakdownQuery,
  useGetMilestonesQuery,
} from '../../store/api/driverScoreApiSlice';
import { useAppSelector } from '../../hooks/redux';
import { RefreshOutlined } from '@mui/icons-material';

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
      id={`driver-score-tabpanel-${index}`}
      aria-labelledby={`driver-score-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export const DriverScorePage: React.FC = () => {
  const [tabValue, setTabValue] = React.useState(0);
  const user = useAppSelector((state) => state.auth.user);
  
  const { data: scoreData, isLoading: scoreLoading, refetch: refetchScore } = useGetDriverScoreQuery();
  const { data: historyData, isLoading: historyLoading } = useGetScoreHistoryQuery();
  const { data: breakdownData, isLoading: breakdownLoading } = useGetScoreBreakdownQuery();
  const { data: milestonesData, isLoading: milestonesLoading } = useGetMilestonesQuery();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    refetchScore();
  };

  // Check if user is verified
  if (user && !user.identityVerified) {
    return (
      <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <PageHeader 
          title="Driver Score" 
          subtitle="Track your driving performance"
        />
        <Alert severity="info" sx={{ mt: 2 }}>
          Identity verification is required to access your driver score. Please complete the verification process first.
        </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 } }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
      <PageHeader 
        title="Driver Score" 
        subtitle="Track your driving performance and unlock rewards"
      />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3, 
        mt: 2 
      }}>
        <Box sx={{ flex: { xs: 'none', md: '0 0 300px' } }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            {scoreData && (
              <DriverScoreCard
                currentScore={scoreData.currentScore}
                change={scoreData.change}
                percentile={scoreData.percentile}
                loading={scoreLoading}
              />
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshOutlined />}
                onClick={handleRefresh}
                disabled={scoreLoading}
              >
                Refresh Score
              </Button>
            </Box>
          </Box>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="driver score tabs">
              <Tab label="History" />
              <Tab label="Breakdown" />
              <Tab label="Achievements" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <ScoreHistory 
              events={historyData || []} 
              loading={historyLoading}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <ScoreBreakdown 
              breakdown={breakdownData || []} 
              loading={breakdownLoading}
            />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Milestones 
              milestones={milestonesData || []} 
              loading={milestonesLoading}
            />
          </TabPanel>
        </Box>
      </Box>
      
      <Box sx={{ mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
        <Typography variant="h6" gutterBottom>
          How Your Score Works
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, 
          gap: 3 
        }}>
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Score Decreases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your score decreases when incidents are reported for your verified vehicles. 
              Different incident types have different impacts on your score.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Score Increases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your score increases through time-based recovery (1 point per 30 days without incidents) 
              and when disputes are resolved in your favor.
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Benefits
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A higher driver score unlocks access to exclusive rewards, insurance discounts, 
              and partner offers. Keep your score above 80 for the best benefits!
            </Typography>
          </Box>
        </Box>
      </Box>
      </Box>
    </Container>
  );
};