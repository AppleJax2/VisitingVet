import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileEarmarkText, ClockFill, ExclamationTriangleFill,
  CheckCircleFill, XCircleFill, HourglassSplit, CalendarEventFill
} from 'react-bootstrap-icons';
import axios from 'axios';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

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
        setServiceRequests(response.data.data || []); // Handle empty data array
        setError('');
      } catch (err) {
        console.error('Error fetching service requests:', err);
        setError(err.response?.data?.message || 'Failed to load service requests');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, []); // Empty dependency array ensures this runs once on mount

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'accepted': return 'info';
      case 'declined': return 'danger';
      case 'scheduled': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'light';
    }
  };
  
  const getUrgencyVariant = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'low': return 'success';
      case 'medium': return 'info';
      case 'high': return 'warning';
      case 'emergency': return 'danger';
      default: return 'light';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <HourglassSplit className="me-1" />;
      case 'accepted': return <CheckCircleFill className="me-1 text-info" />;
      case 'declined': return <XCircleFill className="me-1 text-danger" />;
      case 'scheduled': return <CalendarEventFill className="me-1 text-secondary" />;
      case 'completed': return <CheckCircleFill className="me-1 text-success" />;
      case 'cancelled': return <XCircleFill className="me-1 text-danger" />;
      default: return null;
    }
  };

  const getRequestDetails = (request) => {
    switch (role) {
      case 'Clinic':
        return {
          title: `Request for ${request.pet?.name || 'Pet'} (Owner: ${request.petOwner?.name || 'Unknown'})`,
          subtitle: `Sent to: ${request.provider?.name || 'Unknown Provider'}`,
        };
      case 'MVSProvider':
        return {
          title: `Request from ${request.clinic?.name || 'Clinic'} for Pet: ${request.pet?.name || 'Unknown'}`,
          subtitle: `Owner: ${request.petOwner?.name || 'Unknown'}`,
        };
      case 'PetOwner':
        return {
          title: `Referral for ${request.pet?.name || 'Pet'} to Specialist: ${request.provider?.name || 'Unknown'}`,
          subtitle: `Referred by: ${request.clinic?.name || 'Unknown Clinic'}`,
        };
      default:
        return {
          title: 'Service Request',
          subtitle: '',
        };
    }
  };

  const handleViewDetails = (requestId) => {
    let pathRole = '';
    if (role === 'Clinic') pathRole = 'clinic';
    else if (role === 'MVSProvider') pathRole = 'provider';
    else if (role === 'PetOwner') pathRole = 'pet-owner';
    else pathRole = 'admin'; // Assuming admin view might exist
    navigate(`/dashboard/${pathRole}/service-requests/${requestId}`);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (serviceRequests.length === 0) {
    return (
      <Card className="text-center">
        <Card.Body>
          <Card.Text>No service requests found.</Card.Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {serviceRequests.map((request) => {
        const details = getRequestDetails(request);
        return (
          <Card key={request._id} className="mb-3 shadow-sm">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={5}>
                  <Card.Title className="mb-1" style={{ color: '#343a40' }}>
                    <FileEarmarkText className="me-2" />{details.title}
                  </Card.Title>
                  <Card.Subtitle className="text-muted">
                    {details.subtitle}
                  </Card.Subtitle>
                </Col>
                <Col md={3} className="d-flex flex-column align-items-start gap-1">
                  <Badge bg={getStatusVariant(request.status)} className="d-flex align-items-center">
                    {getStatusIcon(request.status)}
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </Badge>
                  {request.urgency && (
                    <Badge bg={getUrgencyVariant(request.urgency)} className="d-flex align-items-center">
                      <ExclamationTriangleFill className="me-1" />
                      Urgency: {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </Badge>
                  )}
                </Col>
                <Col md={2} className="text-muted">
                  <ClockFill className="me-1" /> {format(new Date(request.createdAt), 'MMM d, yyyy')}
                </Col>
                <Col md={2} className="text-end">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => handleViewDetails(request._id)}
                  >
                    View Details
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        );
      })}
    </div>
  );
};

export default ServiceRequestList; 