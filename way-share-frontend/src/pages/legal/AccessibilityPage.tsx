import React from 'react';
import { Typography, List, ListItem, ListItemText, Alert, Box, Link } from '@mui/material';
import { Accessibility as AccessibilityIcon } from '@mui/icons-material';
import LegalPageLayout from '../../components/layout/LegalPageLayout';

const AccessibilityPage: React.FC = () => {
  return (
    <LegalPageLayout
      title="Accessibility Statement"
      lastUpdated="January 8, 2025"
    >
      <Alert icon={<AccessibilityIcon />} severity="info" sx={{ mb: 3 }}>
        Way-Share is committed to ensuring our platform is accessible to all users, including those with disabilities.
      </Alert>

      <Typography variant="h5" component="h2" gutterBottom>
        1. Our Commitment
      </Typography>
      <Typography paragraph>
        Way-Share is committed to providing a digital platform that is accessible to all users, regardless of their abilities or disabilities. We strive to exceed baseline accessibility requirements and create an inclusive experience that allows everyone to participate in improving road safety.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        2. Accessibility Standards
      </Typography>
      <Typography paragraph>
        We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards. These guidelines explain how to make web content more accessible for people with disabilities and more usable for everyone.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        3. Current Accessibility Features
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        3.1 Keyboard Navigation
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Full keyboard navigation support for all interactive elements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Logical tab order throughout the application" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Visible focus indicators on all focusable elements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Skip links to main content areas" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.2 Screen Reader Support
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Semantic HTML structure with proper heading hierarchy" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Descriptive alt text for all informative images" />
        </ListItem>
        <ListItem>
          <ListItemText primary="ARIA labels and descriptions for complex interface elements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Form labels clearly associated with their controls" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Status messages announced for important updates" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.3 Visual Accessibility
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="High contrast color schemes meeting WCAG AA standards" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Text that can be resized up to 200% without loss of functionality" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Color is not used as the sole means of conveying information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Clear, readable fonts with adequate spacing" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.4 Motor Accessibility
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Large touch targets on mobile devices (minimum 44px)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Generous spacing between interactive elements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Alternative input methods for camera-based features" />
        </ListItem>
        <ListItem>
          <ListItemText primary="No required fine motor actions or precise timing" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.5 Cognitive Accessibility
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Simple, clear language throughout the interface" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Consistent navigation and layout patterns" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Clear error messages with guidance for correction" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Progress indicators for multi-step processes" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Helpful tooltips and contextual information" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        4. Mobile and Touch Accessibility
      </Typography>
      <Typography paragraph>
        Way-Share is designed as a Progressive Web App (PWA) with specific attention to mobile accessibility:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Touch targets meet minimum size requirements" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Gesture-based interactions have alternative methods" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Device orientation changes are supported" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Voice input compatibility where available" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        5. Assistive Technology Compatibility
      </Typography>
      <Typography paragraph>
        Way-Share has been tested with:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="NVDA (Windows)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="JAWS (Windows)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="VoiceOver (macOS and iOS)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="TalkBack (Android)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Voice Control (iOS and macOS)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Switch Control (iOS)" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        6. Known Limitations
      </Typography>
      <Typography paragraph>
        We are continuously working to improve accessibility. Current known limitations include:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Camera-based license plate recognition" 
            secondary="While manual entry is always available as an alternative, some users may find camera features challenging to use."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Interactive map features" 
            secondary="Some map interactions may be challenging for screen reader users, though all essential information is available in alternative formats."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Real-time updates" 
            secondary="Some dynamic content updates may not be immediately announced to screen readers."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        7. Alternative Access Methods
      </Typography>
      <Typography paragraph>
        For users who encounter accessibility barriers, we provide:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Manual license plate entry as an alternative to camera capture" />
        </ListItem>
        <ListItem>
          <ListItemText primary="List view alternatives to map-based displays" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Text-based summaries of visual information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Simplified navigation paths for complex features" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        8. Ongoing Improvement
      </Typography>
      <Typography paragraph>
        Accessibility is an ongoing commitment. We regularly:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Conduct accessibility audits with automated and manual testing" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Test with real assistive technology users" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Review and update our accessibility practices" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Train our development team on accessibility best practices" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        9. Feedback and Support
      </Typography>
      <Typography paragraph>
        We welcome feedback about the accessibility of Way-Share. If you encounter accessibility barriers or have suggestions for improvement, please contact us through our{' '}
        <Link href="/about">About page</Link>.
      </Typography>

      <Typography paragraph>
        When reporting accessibility issues, please include:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Description of the issue and where it occurs" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Your operating system and browser information" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Assistive technology being used (if applicable)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Steps to reproduce the issue" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        10. Third-Party Content
      </Typography>
      <Typography paragraph>
        Way-Share integrates with third-party services such as Mapbox for mapping functionality. While we strive to choose accessible third-party services, we cannot guarantee the accessibility of all external content. We work with our vendors to address accessibility concerns when possible.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        11. Accessibility Resources
      </Typography>
      <Typography paragraph>
        For more information about web accessibility, visit:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Web Content Accessibility Guidelines (WCAG)" 
            secondary="https://www.w3.org/WAI/WCAG21/quickref/"
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="WebAIM (Web Accessibility In Mind)" 
            secondary="https://webaim.org/"
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="A11y Project" 
            secondary="https://www.a11yproject.com/"
          />
        </ListItem>
      </List>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.50', borderRadius: 2, border: '1px solid', borderColor: 'info.200' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'info.main' }}>
          Our Promise
        </Typography>
        <Typography variant="body2">
          Accessibility is not just a compliance checkbox for us—it's a fundamental principle. We believe that road safety is everyone's concern, and our platform should be usable by everyone, regardless of their abilities. We are committed to continuous improvement and welcome your partnership in making Way-Share more accessible.
        </Typography>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        12. Contact Information
      </Typography>
      <Typography paragraph>
        For accessibility-related questions, feedback, or to request accommodations, please contact us through our{' '}
        <Link href="/about">About page</Link>. We aim to respond to accessibility inquiries within 2 business days.
      </Typography>
    </LegalPageLayout>
  );
};

export default AccessibilityPage;