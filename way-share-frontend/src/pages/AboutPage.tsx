import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Groups as GroupsIcon,
  VerifiedUser as VerifiedUserIcon,
  HelpOutline as HelpIcon,
} from '@mui/icons-material';

const AboutPage: React.FC = () => {
  const faqItems = [
    {
      question: 'How does Way-Share protect my privacy?',
      answer:
        'Way-Share uses one-way cryptographic hashing to anonymize all license plates. Location data is rounded to the nearest 100 meters, and no personal information is ever collected or stored. Reports are completely anonymous.',
    },
    {
      question: 'Do I need to create an account?',
      answer:
        'No! Way-Share is designed to work without any user accounts. You can submit reports immediately without signing up or providing any personal information.',
    },
    {
      question: 'What types of incidents can I report?',
      answer:
        'You can report: Speeding, Tailgating, Phone Use While Driving, Failure to Yield, Illegal Parking, Road Rage, and Aggressive Driving.',
    },
    {
      question: 'How quickly can I submit a report?',
      answer:
        'Our streamlined process is designed to take less than 30 seconds. Simply capture or enter the license plate, select the incident type, and submit.',
    },
    {
      question: 'Can I report incidents while offline?',
      answer:
        'Yes! Way-Share works offline. Reports are queued and automatically submitted when you reconnect to the internet.',
    },
    {
      question: 'Is this only for San Jose?',
      answer:
        'Currently, Way-Share is focused on San Jose as our pilot city. We plan to expand to other cities based on community adoption and feedback.',
    },
    {
      question: 'What happens to the data collected?',
      answer:
        'All data is aggregated and anonymized to create heat maps showing incident patterns. This helps identify problem areas and informs traffic safety initiatives.',
    },
    {
      question: 'Can drivers dispute reports?',
      answer:
        'In the current version, reports are purely for community awareness and data collection. There is no dispute process as reports do not result in any penalties.',
    },
  ];

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
      <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        About Way-Share
      </Typography>

      {/* Mission Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Our Mission
        </Typography>
        <Typography paragraph>
          Way-Share is a community-driven platform designed to make roads safer through
          anonymous incident reporting. We believe that collective action can lead to
          positive change in driving behavior and road safety.
        </Typography>
        <Typography paragraph>
          By providing a quick, easy, and completely anonymous way to report traffic
          incidents, we empower citizens to contribute to safer streets without
          compromising their privacy.
        </Typography>
      </Paper>

      {/* Core Principles */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Core Principles
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <SecurityIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Privacy First"
              secondary="All data is anonymized using irreversible hashing. We never collect or store personal information."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <SpeedIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Speed & Simplicity"
              secondary="Report incidents in under 30 seconds with our streamlined, user-friendly interface."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GroupsIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Community Driven"
              secondary="Together, we can identify problem areas and promote safer driving habits."
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <VerifiedUserIcon color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="No Barriers"
              secondary="No accounts, no registration, no personal data required. Just report and go."
            />
          </ListItem>
        </List>
      </Paper>

      {/* Privacy Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }} id="privacy">
        <Typography variant="h5" component="h2" gutterBottom>
          Privacy & Security
        </Typography>
        <Typography paragraph>
          Your privacy is our top priority. Here's how we protect it:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="• License plates are immediately hashed using SHA-256 encryption" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Location data is rounded to the nearest 100 meters" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• No user accounts or personal information required" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• EXIF data is stripped from all uploaded media" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Session IDs are temporary and anonymous" />
          </ListItem>
        </List>
      </Paper>

      {/* FAQ Section */}
      <Box id="faq">
        <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4, mb: 2 }}>
          <HelpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Frequently Asked Questions
        </Typography>
        {faqItems.map((item, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">{item.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
      </Box>
    </Container>
  );
};

export default AboutPage;