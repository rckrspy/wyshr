import React from 'react';
import { Typography, List, ListItem, ListItemText, Alert, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { Cookie as CookieIcon } from '@mui/icons-material';
import LegalPageLayout from '../../components/layout/LegalPageLayout';

const CookiePolicyPage: React.FC = () => {
  const cookieData = [
    {
      name: 'wayshare_session',
      purpose: 'Session management for offline functionality',
      type: 'Essential',
      duration: 'Session',
      thirdParty: 'No'
    },
    {
      name: 'wayshare_preferences',
      purpose: 'Storing user interface preferences',
      type: 'Functional',
      duration: '30 days',
      thirdParty: 'No'
    },
    {
      name: 'pwa_install_prompt',
      purpose: 'Managing app installation prompt display',
      type: 'Functional',
      duration: '90 days',
      thirdParty: 'No'
    }
  ];

  return (
    <LegalPageLayout
      title="Cookie Policy"
      lastUpdated="January 8, 2025"
    >
      <Alert icon={<CookieIcon />} severity="info" sx={{ mb: 3 }}>
        Way-Share uses minimal cookies and local storage to provide essential functionality. We do not use tracking or advertising cookies.
      </Alert>

      <Typography variant="h5" component="h2" gutterBottom>
        1. What Are Cookies?
      </Typography>
      <Typography paragraph>
        Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Local storage is similar technology that allows websites to store data locally on your device.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        2. How Way-Share Uses Cookies
      </Typography>
      <Typography paragraph>
        Way-Share uses cookies and local storage minimally and only for essential functionality. We prioritize your privacy and use these technologies only when necessary to provide our service effectively.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        3. Types of Cookies We Use
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        3.1 Essential Cookies
      </Typography>
      <Typography paragraph>
        These cookies are necessary for the basic functionality of Way-Share and cannot be disabled:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Session Management" 
            secondary="Enables offline report submission and synchronization when you reconnect to the internet."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Security" 
            secondary="Protects against cross-site request forgery and other security threats."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Technical Functionality" 
            secondary="Ensures the Progressive Web App (PWA) features work correctly."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.2 Functional Cookies
      </Typography>
      <Typography paragraph>
        These cookies enhance your experience but are not essential for basic functionality:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="User Preferences" 
            secondary="Remembers your interface preferences and settings."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="App Installation" 
            secondary="Manages the display of Progressive Web App installation prompts."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        3.3 Cookies We Do NOT Use
      </Typography>
      <Typography paragraph>
        Way-Share explicitly does not use:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Advertising or tracking cookies" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Analytics cookies that identify individual users" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Social media tracking cookies" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Cross-site tracking mechanisms" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Third-party advertising networks" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        4. Detailed Cookie Information
      </Typography>
      <TableContainer component={Paper} sx={{ mt: 2, mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Cookie Name</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Duration</strong></TableCell>
              <TableCell><strong>Third Party</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cookieData.map((cookie, index) => (
              <TableRow key={index}>
                <TableCell component="th" scope="row">
                  {cookie.name}
                </TableCell>
                <TableCell>{cookie.purpose}</TableCell>
                <TableCell>{cookie.type}</TableCell>
                <TableCell>{cookie.duration}</TableCell>
                <TableCell>{cookie.thirdParty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="h2" gutterBottom>
        5. Local Storage and PWA Data
      </Typography>
      <Typography paragraph>
        As a Progressive Web App, Way-Share uses additional browser storage mechanisms:
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        5.1 Local Storage
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Offline Report Queue" 
            secondary="Temporarily stores reports when you're offline until they can be submitted."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Application State" 
            secondary="Maintains app state for better user experience across sessions."
          />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        5.2 Service Worker Cache
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Offline Functionality" 
            secondary="Caches app resources to enable offline use of basic features."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Performance" 
            secondary="Speeds up app loading by caching static resources."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        6. Third-Party Cookies
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        6.1 Mapbox
      </Typography>
      <Typography paragraph>
        Way-Share uses Mapbox for mapping services, which may set its own cookies:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Purpose" 
            secondary="Map tile loading, performance optimization, and usage analytics for Mapbox services."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Control" 
            secondary="These cookies are controlled by Mapbox's privacy policy, not Way-Share."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="More Information" 
            secondary="Visit Mapbox's privacy policy for details about their data practices."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        7. Managing Your Cookie Preferences
      </Typography>
      
      <Typography variant="h6" component="h3" gutterBottom>
        7.1 Browser Controls
      </Typography>
      <Typography paragraph>
        You can control cookies through your browser settings:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Block all cookies (may affect functionality)" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Block third-party cookies only" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Delete existing cookies" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Set cookies to expire when you close your browser" />
        </ListItem>
      </List>

      <Typography variant="h6" component="h3" gutterBottom>
        7.2 Browser-Specific Instructions
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Chrome" 
            secondary="Settings > Privacy and security > Cookies and other site data"
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Firefox" 
            secondary="Settings > Privacy & Security > Cookies and Site Data"
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Safari" 
            secondary="Preferences > Privacy > Manage Website Data"
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Edge" 
            secondary="Settings > Cookies and site permissions > Cookies and site data"
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        8. Impact of Disabling Cookies
      </Typography>
      <Typography paragraph>
        If you disable cookies, some features of Way-Share may be affected:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Offline Functionality" 
            secondary="Reports may not be saved when you're offline."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="User Preferences" 
            secondary="Settings may not be remembered between sessions."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Progressive Web App Features" 
            secondary="Installation and offline features may not work properly."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        9. Data Retention
      </Typography>
      <Typography paragraph>
        Cookie and local storage data retention:
      </Typography>
      <List>
        <ListItem>
          <ListItemText 
            primary="Session Cookies" 
            secondary="Deleted when you close your browser."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Persistent Cookies" 
            secondary="Automatically expire after the specified duration (30-90 days)."
          />
        </ListItem>
        <ListItem>
          <ListItemText 
            primary="Local Storage" 
            secondary="Remains until manually cleared or when you uninstall the app."
          />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        10. Privacy and Anonymization
      </Typography>
      <Typography paragraph>
        Important privacy protections related to cookies and storage:
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="No personal information is stored in cookies" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Session IDs are anonymous and temporary" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Offline report data is anonymized before storage" />
        </ListItem>
        <ListItem>
          <ListItemText primary="No cross-site tracking or user profiling" />
        </ListItem>
      </List>

      <Typography variant="h5" component="h2" gutterBottom>
        11. Updates to This Policy
      </Typography>
      <Typography paragraph>
        We may update this Cookie Policy to reflect changes in our practices or for legal compliance. Updates will be posted on this page with a revised "Last Updated" date. Significant changes will be communicated through the app interface.
      </Typography>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'success.50', borderRadius: 2, border: '1px solid', borderColor: 'success.200' }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
          Privacy-First Approach
        </Typography>
        <Typography variant="body2">
          <strong>Our commitment:</strong> Way-Share uses the absolute minimum amount of cookies and storage necessary for functionality. We believe in earning your trust through transparency and restraint, not through collecting every piece of data we technically could.
        </Typography>
      </Box>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mt: 4 }}>
        12. Contact Us
      </Typography>
      <Typography paragraph>
        If you have questions about our use of cookies or this Cookie Policy, please contact us through our{' '}
        <a href="/about">About page</a>.
      </Typography>
    </LegalPageLayout>
  );
};

export default CookiePolicyPage;