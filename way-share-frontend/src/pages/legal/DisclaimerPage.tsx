import React from 'react';
import { Typography, List, ListItem, ListItemText, Alert, Box } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import LegalPageLayout from '../../components/layout/LegalPageLayout';

const DisclaimerPage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Disclaimer"
      lastUpdated="January 8, 2025"
    >
      <Alert icon={<WarningIcon />} severity="warning" sx={{ mb: 3 }}>
        <strong>Important:</strong> Way-Share reports are user-generated content for community awareness only. They are not verified by Way-Share and should not be used for legal or enforcement purposes.
      </Alert>

      <Typography variant="h5" component="h2" gutterBottom>
        1. General Disclaimer
      </Typography>
      <Typography paragraph>
        The information and services provided by Way-Share are offered "as is" without warranty of any kind, either express or implied. Way-Share makes no representations or warranties regarding the accuracy, completeness, reliability, or suitability of any information or services provided through the platform.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        2. User-Generated Content
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        2.1 No Verification of Reports
      </Typography>
      <Typography paragraph>
        All traffic incident reports submitted to Way-Share are user-generated content. Way-Share does not:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Verify the accuracy of submitted reports" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Investigate the circumstances of reported incidents" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Confirm the identity or behavior of reported vehicles" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Endorse or validate any claims made in reports" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        2.2 Potential for Inaccurate Information
      </Typography>
      <Typography paragraph>
        Users should be aware that submitted reports may contain:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Incorrect license plate information due to misreading or transcription errors" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Subjective interpretations of traffic situations" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Unintentionally misleading information due to partial observation" />
        </ListItem>
        <ListItem>
          <ListItemText primary="False or malicious reports submitted by bad actors" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        3. Not Legal Evidence
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        3.1 No Legal Standing
      </Typography>
      <Typography paragraph>
        Reports submitted through Way-Share:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Are not admissible as evidence in legal proceedings" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Cannot be used to establish fault or liability in accidents" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Do not constitute official documentation of traffic violations" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Are not equivalent to police reports or witness statements" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.2 No Enforcement Action
      </Typography>
      <Typography paragraph>
        Way-Share data:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Does not trigger any enforcement action against reported vehicles" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Is not shared with law enforcement for individual case purposes" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Cannot result in traffic citations or penalties" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        4. Service Availability
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        4.1 No Guarantee of Uptime
      </Typography>
      <Typography paragraph>
        Way-Share does not guarantee:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Continuous availability of the platform" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Error-free operation of all features" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Compatibility with all devices or browsers" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Uninterrupted data transmission or storage" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        4.2 Technical Limitations
      </Typography>
      <Typography paragraph>
        Users acknowledge that technical limitations may affect:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="GPS accuracy and location precision" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Camera functionality for license plate capture" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Offline functionality and data synchronization" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Real-time data updates and display" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        5. Third-Party Content and Services
      </Typography>
      <Typography paragraph>
        Way-Share may integrate with third-party services such as mapping providers. We disclaim responsibility for:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="The accuracy of third-party mapping data" />
        </ListItem>
        <ListItem>
          <ListItemText primary="The availability of third-party services" />
        </ListItem>
        <ListItem>
          <ListItemText primary="The privacy practices of third-party providers" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Any content or services accessible through external links" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        6. Limitation of Liability
      </Typography>
      <Typography paragraph>
        To the maximum extent permitted by law, Way-Share shall not be liable for any damages arising from:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Reliance on user-generated reports or data" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Decisions made based on platform information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Service interruptions or technical failures" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Actions taken by third parties based on platform data" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Any consequences of using or not using the platform" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        7. Use at Your Own Risk
      </Typography>
      <Typography paragraph>
        Users acknowledge that they use Way-Share entirely at their own risk and discretion. You are responsible for:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Verifying any information before acting upon it" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Using the platform in a safe and legal manner" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Complying with all applicable laws and regulations" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Understanding the limitations of crowdsourced data" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        8. No Professional Advice
      </Typography>
      <Typography paragraph>
        Way-Share does not provide professional advice of any kind, including but not limited to:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Legal advice regarding traffic laws or violations" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Insurance advice related to traffic incidents" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Driving instruction or safety recommendations" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        9. Geographic Limitations
      </Typography>
      <Typography paragraph>
        Way-Share currently focuses on San Jose, California, and surrounding areas. Data accuracy and completeness may vary by location. The platform is not intended for use outside its designated service area.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        10. Changes to Disclaimer
      </Typography>
      <Typography paragraph>
        This disclaimer may be updated periodically to reflect changes in our services or legal requirements. Updates will be posted on this page with a revised "Last Updated" date.
      </Typography>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'warning.50', borderRadius: 2, border: '1px solid', borderColor: 'warning.200' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
          Key Reminder
        </Typography>
        <Typography variant="body2">
          <strong>Way-Share is a community awareness tool, not an enforcement mechanism.</strong> Think of it like a neighborhood watch bulletin board—useful for understanding patterns and staying informed, but not a substitute for official reporting to authorities when appropriate.
        </Typography>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        11. Contact Information
      </Typography>
      <Typography paragraph>
        If you have questions about this disclaimer or need clarification about Way-Share's limitations, please contact us through our{' '}
        <a href="/about">About page</a>.
      </Typography>
    </LegalPageLayout>
  );
};

export default DisclaimerPage;