import React from 'react';
import { Typography, Box, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';
import LegalPageLayout from '../../components/layout/LegalPageLayout';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="January 8, 2025"
    >
      <Alert icon={<SecurityIcon />} severity="info" sx={{ mb: 3 }}>
        Way-Share is built with privacy-by-design principles. We collect minimal data and immediately anonymize all personally identifiable information.
      </Alert>

      <Typography variant="h5" component="h2" gutterBottom>
        1. Information We Collect
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        1.1 Anonymous Report Data
      </Typography>
      <Typography paragraph>
        When you submit a traffic incident report, we collect:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="License Plate Information" 
            secondary="Immediately converted to an irreversible cryptographic hash using SHA-256 encryption with salt. The original license plate number is never stored."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Location Data" 
            secondary="Rounded to the nearest 100 meters (approximately 1 city block) to protect your exact location while maintaining data usefulness."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Incident Type" 
            secondary="The category of traffic incident you select (e.g., speeding, tailgating, phone use)."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Timestamp" 
            secondary="The date and time when the report was submitted."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Optional Description" 
            secondary="Any additional details you choose to provide about the incident."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        1.2 Technical Data
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Session Identifiers" 
            secondary="Temporary, anonymous session tokens used for offline functionality. These do not identify you personally."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Device Information" 
            secondary="Basic device capabilities for optimal app performance (screen size, offline support). No device identifiers are collected."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        2. Information We Do NOT Collect
      </Typography>
      <Typography paragraph>
        Way-Share explicitly does not collect:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Names, email addresses, or phone numbers" />
        </ListItem>
        <ListItem>
          <ListItemText primary="User accounts or registration information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Your exact location or GPS coordinates" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Device identifiers (IMEI, advertising IDs, etc.)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="IP addresses or network information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Browsing history or other website activity" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        3. How We Protect Your Privacy
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        3.1 Anonymization Technology
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Cryptographic Hashing" 
            secondary="License plates are processed through SHA-256 hashing with a unique salt, making it computationally impossible to reverse the process."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Location Rounding" 
            secondary="GPS coordinates are rounded to 0.001 degrees (approximately 100 meters), providing useful data while protecting your exact location."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="No Cross-Reference Data" 
            secondary="We don't collect any information that could be used to cross-reference or identify users."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.2 Data Security
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Encryption in Transit" 
            secondary="All data transmission uses HTTPS encryption."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Secure Storage" 
            secondary="Data is stored in secure, access-controlled databases."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Minimal Data Retention" 
            secondary="Only anonymized, aggregated data necessary for safety insights is retained."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        4. How We Use Your Information
      </Typography>
      <Typography paragraph>
        Anonymized data is used exclusively for:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Creating traffic incident heat maps for community awareness" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Generating aggregate statistics about traffic patterns" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Identifying high-incident areas for potential safety improvements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Improving the Way-Share platform functionality" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        5. Data Sharing and Disclosure
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        5.1 What We Share
      </Typography>
      <Typography paragraph>
        We may share anonymized, aggregated data with:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Local government agencies for traffic safety planning" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Academic researchers studying traffic safety (with appropriate agreements)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Public safety organizations for community benefit" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        5.2 What We Never Share
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Individual report details that could identify specific incidents" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Any data that could be used to identify users or specific vehicles" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Raw location data or exact coordinates" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        6. Third-Party Services
      </Typography>
      <Typography paragraph>
        Way-Share integrates with the following third-party services:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Mapbox" 
            secondary="Provides mapping services. Mapbox may collect standard web analytics. See Mapbox's privacy policy for details."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        7. Cookies and Local Storage
      </Typography>
      <Typography paragraph>
        Way-Share uses minimal cookies and local storage for:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Session management to enable offline report submission" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Storing user preferences (if any)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Progressive Web App functionality" />
        </ListItem>
      </List>
      <Typography paragraph>
        We do not use tracking cookies or advertising cookies. For more details, see our{' '}
        <a href="/legal/cookies">Cookie Policy</a>.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        8. Your Privacy Rights
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        8.1 California Residents (CCPA)
      </Typography>
      <Typography paragraph>
        Under the California Consumer Privacy Act, you have the right to:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Know what information we collect" 
            secondary="This privacy policy provides complete transparency about our data practices."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Request deletion of personal information" 
            secondary="Due to our anonymization practices, we cannot identify or delete specific user data, as no personally identifiable information is retained."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Opt-out of sale" 
            secondary="We do not sell personal information and never will."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        8.2 Limitations Due to Anonymization
      </Typography>
      <Typography paragraph>
        Because Way-Share immediately anonymizes all data, we cannot:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Identify which reports came from which users" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Delete specific user data (since we don't know which data belongs to whom)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Provide copies of personal data (since none is retained in personally identifiable form)" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        9. Data Retention
      </Typography>
      <Typography paragraph>
        Anonymized, aggregated data may be retained indefinitely for the purpose of traffic safety research and community benefit. No personally identifiable information is ever retained beyond the immediate processing required for anonymization.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        10. Children's Privacy
      </Typography>
      <Typography paragraph>
        Way-Share does not knowingly collect information from children under 13. If you believe a child has used our service, please contact us through our{' '}
        <a href="/about">About page</a>.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        11. Changes to This Privacy Policy
      </Typography>
      <Typography paragraph>
        We may update this Privacy Policy to reflect changes in our practices or for legal compliance. We will post the updated policy on this page with a new "Last Updated" date.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        12. Contact Us
      </Typography>
      <Typography paragraph>
        If you have questions about this Privacy Policy or our privacy practices, please contact us through our{' '}
        <a href="/about">About page</a>.
      </Typography>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.50', borderRadius: 2, border: '1px solid', borderColor: 'primary.200' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
          Privacy Summary
        </Typography>
        <Typography variant="body2">
          <strong>Bottom Line:</strong> Way-Share is designed so that even we cannot identify who submitted which reports. Your license plate entries are immediately hashed, your location is rounded, and no personal information is ever collected or stored. This isn't just a policy promise—it's technically impossible for us to violate your privacy because the data simply doesn't exist in an identifiable form.
        </Typography>
      </Box>
    </LegalPageLayout>
  );
};

export default PrivacyPolicyPage;