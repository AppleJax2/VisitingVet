import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Button,
  Tabs,
  Tab,
  Card,
  Spinner,
  Alert
} from 'react-bootstrap';
import { PlusCircle } from 'react-bootstrap-icons';
import { useAuth } from '../contexts/AuthContext';
import ServiceRequestList from '../components/Dashboard/ServiceRequestList';
import ServiceRequestForm from '../components/Dashboard/ServiceRequestForm';
import axios from 'axios';

const ServiceRequestsPage = () => {
  const { user } = useAuth();
  const [key, setKey] = useState('all'); // Tab key state
  const [showForm, setShowForm] = useState(false);
  const [refreshList, setRefreshList] = useState(0); // State to trigger list refresh
  const [stats, setStats] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');

  // Determine page title and configurations based on user role
  const getPageConfig = () => {
    switch (user.role) {
      case 'Clinic':
        return {
          title: 'Specialized Service Requests',
          description: 'Manage referrals sent to mobile veterinary specialists.',
          canCreate: true,
          tabs: [
            { key: 'all', title: 'All Requests' },
            { key: 'pending', title: 'Pending Provider' },
            { key: 'accepted', title: 'Pending Owner' },
            { key: 'scheduled', title: 'Scheduled' },
            { key: 'completed', title: 'Completed' },
            { key: 'cancelled', title: 'Cancelled/Declined' },
          ],
        };
      case 'MVSProvider':
        return {
          title: 'Service Requests Received',
          description: 'Manage service requests received from veterinary clinics.',
          canCreate: false,
          tabs: [
            { key: 'all', title: 'All Requests' },
            { key: 'pending', title: 'Pending Your Response' },
            { key: 'accepted', title: 'Accepted (Pending Owner)' },
            { key: 'scheduled', title: 'Scheduled' },
            { key: 'completed', title: 'Completed' },
            { key: 'declined', title: 'Declined by You' },
          ],
        };
      case 'PetOwner':
        return {
          title: 'Specialist Referrals',
          description: 'View and manage specialist referrals initiated by your veterinary clinic.',
          canCreate: false,
          tabs: [
            { key: 'all', title: 'All Referrals' },
            { key: 'accepted', title: 'Pending Your Selection' },
            { key: 'scheduled', title: 'Scheduled' },
            { key: 'completed', title: 'Completed' },
            { key: 'cancelled', title: 'Cancelled/Declined' },
          ],
        };
      default:
        return {
          title: 'Service Requests',
          description: 'View and manage service requests.',
          canCreate: false,
          tabs: [{ key: 'all', title: 'All Requests' }],
        };
    }
  };
  
  // Fetch admin stats if user is admin
  useEffect(() => {
    if (user.role === 'Admin') {
        const fetchStats = async () => {
            setLoadingStats(true);
            setStatsError('');
            try {
                const response = await axios.get('/api/service-requests/stats/overview');
                setStats(response.data.data);
            } catch (err) {
                console.error('Error fetching service request stats:', err);
                setStatsError(err.response?.data?.message || 'Failed to load statistics.');
            }
            setLoadingStats(false);
        };
        fetchStats();
    }
  }, [user.role]);

  const pageConfig = getPageConfig();

  const handleCreateSuccess = (newRequest) => {
    setShowForm(false);
    setRefreshList(prev => prev + 1); // Increment to trigger refresh
    setKey('all'); // Switch to the 'all' tab to see the new request
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  return (
    <Container fluid="lg" className="py-4">
      <Row className="align-items-center mb-3">
        <Col>
          <h1>{pageConfig.title}</h1>
          <p className="text-muted">{pageConfig.description}</p>
        </Col>
        {pageConfig.canCreate && !showForm && (
          <Col xs="auto">
            <Button variant="primary" onClick={() => setShowForm(true)}>
              <PlusCircle className="me-2" /> Create New Request
            </Button>
          </Col>
        )}
      </Row>

      {showForm ? (
        <ServiceRequestForm onSuccess={handleCreateSuccess} onCancel={handleCancelForm} />
      ) : (
        <Card className="shadow-sm">
          <Card.Header className="p-0">
            <Tabs
              id="service-requests-tabs"
              activeKey={key}
              onSelect={(k) => setKey(k)}
              className="border-bottom-0"
            >
              {pageConfig.tabs.map((tab) => (
                <Tab key={tab.key} eventKey={tab.key} title={tab.title} />
              ))}
            </Tabs>
          </Card.Header>
          <Card.Body>
            {user.role === 'Admin' && (
                 <Row className="mb-3">
                    <Col><strong>Total Requests:</strong> {loadingStats ? <Spinner size="sm"/> : stats.totalRequests ?? 'N/A'}</Col>
                    {/* Add more stats display here as needed */}
                 </Row>
            )}
            <ServiceRequestList role={user.role} key={refreshList} statusFilter={key === 'all' ? null : key} />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ServiceRequestsPage; 