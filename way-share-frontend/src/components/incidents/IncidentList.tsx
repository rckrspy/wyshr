import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Incident, IncidentStats } from '../../store/api/incidentApiSlice';
import { IncidentDetailDialog } from './IncidentDetailDialog';

interface IncidentListProps {
  incidents: Incident[];
  stats?: IncidentStats;
}

export const IncidentList = ({ incidents, stats }: IncidentListProps) => {
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIncidentId, setMenuIncidentId] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, incidentId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuIncidentId(incidentId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIncidentId(null);
  };

  const handleViewDetails = (incidentId: string) => {
    setSelectedIncident(incidentId);
    handleMenuClose();
  };

  const getStatusIcon = (incident: Incident) => {
    if (incident.incident_status === 'disputed') {
      return <WarningIcon color="warning" />;
    }
    if (incident.owner_viewed_at) {
      return <CheckCircleIcon color="success" />;
    }
    return <ScheduleIcon color="action" />;
  };

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'disputed':
        return 'warning';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatIncidentType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      {stats && (
        <Box 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2, 
            mb: 3 
          }}
        >
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.totalIncidents}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total Incidents
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.viewedIncidents}</Typography>
            <Typography variant="body2" color="text.secondary">
              Viewed
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.unresolvedIncidents}</Typography>
            <Typography variant="body2" color="text.secondary">
              Unresolved
            </Typography>
          </Paper>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4">{stats.disputedIncidents}</Typography>
            <Typography variant="body2" color="text.secondary">
              Disputed
            </Typography>
          </Paper>
        </Box>
      )}

      <Box>
        {incidents.map((incident) => (
          <Paper
            key={incident.id}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: !incident.owner_viewed_at ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 2,
              },
            }}
            onClick={() => handleViewDetails(incident.id)}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center" gap={2}>
                {getStatusIcon(incident)}
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatIncidentType(incident.incident_type)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {incident.license_plate_plaintext} • {incident.state}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(incident.created_at), 'PPp')}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={incident.incident_status}
                  size="small"
                  color={getStatusColor(incident.incident_status)}
                />
                {!incident.owner_viewed_at && (
                  <Chip
                    label="New"
                    size="small"
                    color="error"
                    icon={<VisibilityIcon />}
                  />
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuOpen(e, incident.id);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {incident.description && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {incident.description}
              </Typography>
            )}
          </Paper>
        ))}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuIncidentId && handleViewDetails(menuIncidentId)}>
          View Details
        </MenuItem>
      </Menu>

      {selectedIncident && (
        <IncidentDetailDialog
          incidentId={selectedIncident}
          open={true}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </>
  );
};