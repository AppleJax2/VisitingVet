import React from 'react';
import { Container, Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ServiceRequestDetail from '../components/Dashboard/ServiceRequestDetail';

const ServiceRequestDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  
  const getDashboardPath = () => {
    if (user.role === 'pet_owner') return '/dashboard/pet-owner';
    return `/dashboard/${user.role}`;
  };
  
  const getServiceRequestsPath = () => {
    if (user.role === 'pet_owner') return '/dashboard/pet-owner/service-requests';
    return `/dashboard/${user.role}/service-requests`;
  };
  
  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to={getDashboardPath()} color="inherit">
            Dashboard
          </Link>
          <Link component={RouterLink} to={getServiceRequestsPath()} color="inherit">
            {user.role === 'pet_owner' ? 'Specialist Referrals' : 'Service Requests'}
          </Link>
          <Typography color="textPrimary">
            Request Details
          </Typography>
        </Breadcrumbs>
        
        <ServiceRequestDetail />
      </Box>
    </Container>
  );
};

export default ServiceRequestDetailPage; 