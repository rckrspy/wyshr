import React from 'react';
import { Typography, Box, List, ListItem, ListItemText } from '@mui/material';
import LegalPageLayout from '../../components/layout/LegalPageLayout';

const TermsOfServicePage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="January 8, 2025"
    >
      <Typography variant="h5" component="h2" gutterBottom>
        1. Acceptance of Terms
      </Typography>
      <Typography paragraph>
        By accessing and using Way-Share ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        2. Service Description
      </Typography>
      <Typography paragraph>
        Way-Share is a community-driven platform that enables anonymous reporting of traffic incidents to promote road safety. The Platform allows users to:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Submit anonymous reports of traffic incidents" />
        </ListItem>
        <ListItem>
          <ListItemText primary="View aggregated incident data through heat maps" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Access educational content about road safety" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        3. User Responsibilities
      </Typography>
      <Typography paragraph>
        By using Way-Share, you agree to:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Provide accurate and truthful information in all reports" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Use the Platform only for legitimate road safety purposes" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Not attempt to identify or harass other road users" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Not submit false, misleading, or malicious reports" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Comply with all applicable local, state, and federal laws" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        4. Prohibited Uses
      </Typography>
      <Typography paragraph>
        You may NOT use Way-Share to:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Attempt to de-anonymize or identify specific individuals" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Use data for commercial purposes without written permission" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Submit reports for harassment, revenge, or malicious purposes" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Attempt to bypass or interfere with the Platform's security features" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Violate any applicable laws or regulations" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        5. Data and Privacy
      </Typography>
      <Typography paragraph>
        Way-Share is designed with privacy as a core principle. All license plate information is immediately and irreversibly anonymized using cryptographic hashing. Location data is rounded to protect user privacy. For complete details on our data practices, please see our{' '}
        <a href="/legal/privacy">Privacy Policy</a>.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        6. User-Generated Content
      </Typography>
      <Typography paragraph>
        By submitting reports or other content to Way-Share, you grant us a non-exclusive, worldwide, royalty-free license to use, modify, and distribute such content in anonymized and aggregated form for the purposes of road safety improvement and community benefit.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        7. Disclaimer of Warranties
      </Typography>
      <Typography paragraph>
        Way-Share is provided "as is" without warranty of any kind. We make no representations or warranties regarding:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="The accuracy, completeness, or reliability of user-generated reports" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Continuous availability or error-free operation of the Platform" />
        </ListItem>
        <ListItem>
          <ListItemText primary="The suitability of the Platform for any particular purpose" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        8. Limitation of Liability
      </Typography>
      <Typography paragraph>
        To the maximum extent permitted by law, Way-Share and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, incurred by you or any third party, whether in an action of contract or tort, even if we have been advised of the possibility of such damages.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        9. Geographic Scope
      </Typography>
      <Typography paragraph>
        Way-Share currently operates primarily in San Jose, California, and surrounding areas. These Terms of Service are governed by the laws of the State of California, without regard to conflict of law principles.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        10. Account-Free Service
      </Typography>
      <Typography paragraph>
        Way-Share operates without user accounts or registration. These terms apply to all users of the Platform regardless of the absence of formal account creation.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        11. Modifications to Terms
      </Typography>
      <Typography paragraph>
        We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated "Last Modified" date. Continued use of the Platform after such changes constitutes acceptance of the new terms.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        12. Termination
      </Typography>
      <Typography paragraph>
        We reserve the right to restrict or terminate access to the Platform at our discretion, particularly in cases of misuse or violation of these terms.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        13. Severability
      </Typography>
      <Typography paragraph>
        If any provision of these Terms of Service is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the Terms of Service will otherwise remain in full force and effect.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        14. Contact Information
      </Typography>
      <Typography paragraph>
        Questions about these Terms of Service should be directed to us through our{' '}
        <a href="/about">About page</a> contact information.
      </Typography>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          <strong>Important Notice:</strong> Reports submitted through Way-Share are for community awareness and data collection purposes only. They are not intended for use in legal proceedings or as evidence in any formal dispute resolution process.
        </Typography>
      </Box>
    </LegalPageLayout>
  );
};

export default TermsOfServicePage;