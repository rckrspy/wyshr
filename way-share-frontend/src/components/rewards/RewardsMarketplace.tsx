import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  useGetPartnersQuery,
  useCheckEligibilityQuery,
  useRequestQuoteMutation,
  RewardPartner,
  QuoteRequest,
} from '../../store/api/rewardsApiSlice';
import { useGetDriverScoreQuery } from '../../store/api/driverScoreApiSlice';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const CategoryTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 1,
  borderColor: 'divider',
  marginBottom: theme.spacing(3),
}));

const ScoreChip = styled(Chip)<{ eligible: boolean }>(({ theme, eligible }) => ({
  backgroundColor: eligible ? theme.palette.success.main : theme.palette.error.main,
  color: 'white',
  fontWeight: 'bold',
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
      id={`category-tabpanel-${index}`}
      aria-labelledby={`category-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const RewardsMarketplace: React.FC = () => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState<RewardPartner | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest>({
    partner_id: '',
    contact_method: 'email',
    contact_email: '',
    contact_phone: '',
    notes: '',
  });

  const categories = ['all', 'insurance', 'maintenance', 'retail'];
  const categoryLabels = ['All Partners', 'Insurance', 'Maintenance', 'Retail'];

  const currentCategory = categories[selectedCategory];
  const categoryFilter = currentCategory === 'all' ? undefined : currentCategory;

  const { data: partnersData, isLoading: partnersLoading } = useGetPartnersQuery(categoryFilter);
  const { data: eligibilityData } = useCheckEligibilityQuery(undefined);
  const { data: driverScoreData } = useGetDriverScoreQuery();
  const [requestQuoteMutation, { isLoading: requestingQuote }] = useRequestQuoteMutation();

  const partners = partnersData?.data || [];
  const eligibility = eligibilityData?.data || [];
  const currentScore = driverScoreData?.currentScore || 0;

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedCategory(newValue);
  };

  const handleRequestQuote = (partner: RewardPartner) => {
    setSelectedPartner(partner);
    setQuoteRequest({
      partner_id: partner.id,
      contact_method: 'email',
      contact_email: '',
      contact_phone: '',
      notes: '',
    });
    setQuoteDialogOpen(true);
  };

  const handleQuoteSubmit = async () => {
    try {
      await requestQuoteMutation(quoteRequest).unwrap();
      setQuoteDialogOpen(false);
      setSelectedPartner(null);
      // Show success message
    } catch (error) {
      console.error('Failed to request quote:', error);
    }
  };

  const isEligible = (partnerId: string) => {
    const partnerEligibility = eligibility.find(e => e.partner_id === partnerId);
    return partnerEligibility?.eligible || false;
  };

  const getScoreGap = (partnerId: string) => {
    const partnerEligibility = eligibility.find(e => e.partner_id === partnerId);
    return partnerEligibility?.score_gap || 0;
  };

  if (partnersLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" flexGrow={1} minHeight={0}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Rewards Marketplace
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Unlock exclusive benefits and discounts based on your driving score. 
        The safer you drive, the better rewards you can access.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Your Current Score: {currentScore}
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Higher scores unlock better rewards and discounts from our partners.
        </Alert>
      </Box>

      <CategoryTabs value={selectedCategory} onChange={handleCategoryChange}>
        {categoryLabels.map((label, index) => (
          <Tab key={index} label={label} />
        ))}
      </CategoryTabs>

      {categoryLabels.map((_, index) => (
        <TabPanel key={index} value={selectedCategory} index={index}>
          <Grid container spacing={2}>
            {partners.map((partner) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={partner.id}>
                <StyledCard>
                  {partner.logo_url && (
                    <CardMedia
                      component="img"
                      height="120"
                      image={partner.logo_url}
                      alt={partner.name}
                      sx={{ objectFit: 'contain', p: theme.spacing(2) }}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {partner.name}
                    </Typography>
                    
                    <Chip
                      label={partner.category}
                      size="small"
                      sx={{ mb: theme.spacing(1) }}
                      color="secondary"
                    />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {partner.description}
                    </Typography>
                    
                    <Box sx={{ mb: theme.spacing(2) }}>
                      <Typography variant="body2" color="text.secondary">
                        Minimum Score Required: {partner.minimum_score}
                      </Typography>
                      <ScoreChip
                        label={isEligible(partner.id) ? 'Eligible' : `Need ${getScoreGap(partner.id)} more points`}
                        size="small"
                        eligible={isEligible(partner.id)}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!isEligible(partner.id)}
                      onClick={() => handleRequestQuote(partner)}
                    >
                      {isEligible(partner.id) ? 'Request Quote' : 'Improve Score to Unlock'}
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      ))}

      <Dialog open={quoteDialogOpen} onClose={() => setQuoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Request Quote from {selectedPartner?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Contact Method</InputLabel>
              <Select
                value={quoteRequest.contact_method}
                onChange={(e) => setQuoteRequest({
                  ...quoteRequest,
                  contact_method: e.target.value as 'email' | 'phone'
                })}
              >
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="phone">Phone</MenuItem>
              </Select>
            </FormControl>

            {quoteRequest.contact_method === 'email' && (
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={quoteRequest.contact_email}
                onChange={(e) => setQuoteRequest({
                  ...quoteRequest,
                  contact_email: e.target.value
                })}
                sx={{ mb: 2 }}
                required
              />
            )}

            {quoteRequest.contact_method === 'phone' && (
              <TextField
                fullWidth
                label="Phone Number"
                type="tel"
                value={quoteRequest.contact_phone}
                onChange={(e) => setQuoteRequest({
                  ...quoteRequest,
                  contact_phone: e.target.value
                })}
                sx={{ mb: 2 }}
                required
              />
            )}

            <TextField
              fullWidth
              label="Additional Notes (Optional)"
              multiline
              rows={3}
              value={quoteRequest.notes}
              onChange={(e) => setQuoteRequest({
                ...quoteRequest,
                notes: e.target.value
              })}
              placeholder="Any specific requirements or questions..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleQuoteSubmit}
            variant="contained"
            disabled={requestingQuote}
          >
            {requestingQuote ? <CircularProgress size={20} /> : 'Request Quote'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RewardsMarketplace;