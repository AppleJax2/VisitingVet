import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Grid, 
  CircularProgress,
  Divider,
  Tooltip,
  IconButton
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Assignment as AssignmentIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Attachment as AttachmentIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

// Status colors
const statusColors = {
  pending: 'warning',
  accepted: 'info',
  declined: 'error',
  scheduled: 'secondary',
  completed: 'success',
  cancelled: 'error'
};

// Urgency colors
const urgencyColors = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  emergency: 'error'
};

const ServiceRequestList = ({ role }) => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServiceRequests = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/service-requests');
        setServiceRequests(response.data.data);
        setError('');
      } catch (err) {
        console.error('Error fetching service requests:', err);
        setError('Failed to load service requests');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, []);

  const getRequestDetails = (request) => {
    switch (role) {
      case 'clinic':
        return {
          title: `Request for ${request.pet?.name || 'Unknown Pet'}`,
          subtitle: `To: ${request.provider?.name || 'Unknown Provider'}`,
          description: `Service request for specialized care`
        };
      case 'provider':
        return {
          title: `Request from ${request.clinic?.name || 'Unknown Clinic'}`,
          subtitle: `For: ${request.pet?.name || 'Unknown Pet'}`,
          description: `Owner: ${request.petOwner?.name || 'Unknown Owner'}`
        };
      case 'pet_owner':
        return {
          title: `Request from ${request.clinic?.name || 'Unknown Clinic'}`,
          subtitle: `To: ${request.provider?.name || 'Unknown Provider'}`,
          description: `For your pet: ${request.pet?.name || 'Unknown Pet'}`
        };
      default:
        return {
          title: 'Service Request',
          subtitle: '',
          description: ''
        };
    }
  };

  const handleViewDetails = (requestId) => {
    navigate(`/dashboard/${role === 'pet_owner' ? 'pet-owner' : role}/service-requests/${requestId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (serviceRequests.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="body1">No service requests found.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2}>
        {serviceRequests.map((request) => {
          const details = getRequestDetails(request);
          
          return (
            <Grid item xs={12} key={request._id}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center">
                        <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                        <Box>
                          <Typography variant="h6">{details.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {details.subtitle}
                          </Typography>
                          <Typography variant="body2">
                            {details.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Chip 
                          label={`Status: ${request.status.charAt(0).toUpperCase() + request.status.slice(1)}`}
                          color={statusColors[request.status]}
                          size="small"
                        />
                        {request.urgency && (
                          <Chip 
                            label={`Urgency: ${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}`}
                            color={urgencyColors[request.urgency]}
                            size="small"
                          />
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={3}>
                      <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                        <Typography variant="caption" display="flex" alignItems="center">
                          <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          size="small" 
                          onClick={() => handleViewDetails(request._id)}
                          sx={{ mt: 1 }}
                        >
                          View Details
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ServiceRequestList; 