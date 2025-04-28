import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ServiceRequestList from '../components/Dashboard/ServiceRequestList';
import ServiceRequestForm from '../components/Dashboard/ServiceRequestForm';

const ServiceRequestsPage = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [showForm, setShowForm] = useState(false);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleCreateSuccess = () => {
    setShowForm(false);
    // Force a re-render of the list
    window.location.reload();
  };

  // Determine page title and actions based on user role
  const getPageConfig = () => {
    switch (user.role) {
      case 'clinic':
        return {
          title: 'Specialized Service Requests',
          description: 'Manage referrals to mobile veterinary specialists',
          canCreate: true,
          tabs: ['All Requests', 'Pending', 'Active', 'Completed']
        };
      case 'provider':
        return {
          title: 'Service Requests',
          description: 'Manage service requests from veterinary clinics',
          canCreate: false,
          tabs: ['All Requests', 'Pending', 'Accepted', 'Scheduled', 'Completed']
        };
      case 'pet_owner':
        return {
          title: 'Specialist Referrals',
          description: 'View and manage specialist referrals from your veterinary clinic',
          canCreate: false,
          tabs: ['All Referrals', 'Pending', 'Scheduled', 'Completed']
        };
      default:
        return {
          title: 'Service Requests',
          description: 'View and manage service requests',
          canCreate: false,
          tabs: ['All Requests']
        };
    }
  };

  const pageConfig = getPageConfig();

  return (
    <Container maxWidth="lg">
      <Box py={4}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {pageConfig.title}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              {pageConfig.description}
            </Typography>
          </Box>
          {pageConfig.canCreate && !showForm && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
            >
              Create Request
            </Button>
          )}
        </Box>

        {showForm ? (
          <Box mb={4}>
            <ServiceRequestForm onSuccess={handleCreateSuccess} />
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Paper variant="outlined">
            <Tabs
              value={tab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              {pageConfig.tabs.map((tabLabel, index) => (
                <Tab key={index} label={tabLabel} />
              ))}
            </Tabs>
            <Divider />
            <Box p={3}>
              <ServiceRequestList role={user.role} />
            </Box>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ServiceRequestsPage; 