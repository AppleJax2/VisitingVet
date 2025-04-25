import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Tabs, Tab } from 'react-bootstrap';
import { getMyAppointmentsProvider, updateAppointmentStatus, checkAuthStatus } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const ProviderAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('requested');
  const navigate = useNavigate();

  // Format date function (assuming there's a utility for this)
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return '';
    // Using formatDate utility if available, or creating a basic one
    try {
      return formatDate(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (e) {
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  };

  // Fetch appointments when the component mounts or active tab changes
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const data = await checkAuthStatus();
        if (!data || !data.success) {
          navigate('/login');
          return;
        }
        
        if (data.user.role !== 'MVSProvider') {
          navigate('/dashboard');
          return;
        }
        
        fetchAppointments();
      } catch (err) {
        setError('Authentication failed. Please login again.');
        navigate('/login');
      }
    };

    verifyUser();
  }, [navigate, activeTab]);

  // Function to fetch appointments based on status
  const fetchAppointments = async () => {
    setIsLoading(true);
    setError('');
    try {
      let status = null;
      
      // Map active tab to status filter
      if (activeTab === 'requested') {
        status = 'Requested';
      } else if (activeTab === 'confirmed') {
        status = 'Confirmed';
      } else if (activeTab === 'past') {
        // For past appointments, we'll fetch both Completed and Cancelled
        // and filter client-side, or we could make multiple calls
        const completedData = await getMyAppointmentsProvider('Completed');
        const cancelledData = await getMyAppointmentsProvider('Cancelled');
        
        if (completedData.success && cancelledData.success) {
          setAppointments([
            ...completedData.data,
            ...cancelledData.data
          ]);
        }
        
        setIsLoading(false);
        return;
      }
      
      // Fetch appointments with the selected status
      const response = await getMyAppointmentsProvider(status);
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setIsLoading(true);
      setError('');
      setUpdateSuccess('');
      
      const response = await updateAppointmentStatus(appointmentId, newStatus);
      
      if (response.success) {
        setUpdateSuccess(`Appointment ${newStatus.toLowerCase()} successfully!`);
        // Refresh the appointments list
        fetchAppointments();
      }
    } catch (err) {
      setError(`Failed to ${newStatus.toLowerCase()} appointment. Please try again.`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments by status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Requested':
        return <Badge bg="info">Requested</Badge>;
      case 'Confirmed':
        return <Badge bg="success">Confirmed</Badge>;
      case 'Cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      case 'Completed':
        return <Badge bg="secondary">Completed</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Manage Appointments</h1>
      
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}
      
      {updateSuccess && (
        <Alert variant="success" onClose={() => setUpdateSuccess('')} dismissible>
          {updateSuccess}
        </Alert>
      )}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="requested" title="Requested">
          {renderAppointmentsTable('requested')}
        </Tab>
        <Tab eventKey="confirmed" title="Confirmed">
          {renderAppointmentsTable('confirmed')}
        </Tab>
        <Tab eventKey="past" title="Past Appointments">
          {renderAppointmentsTable('past')}
        </Tab>
      </Tabs>
    </Container>
  );

  function renderAppointmentsTable(tabKey) {
    if (isLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <Card>
          <Card.Body className="text-center py-5">
            <p className="mb-0">No {tabKey} appointments found.</p>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Card>
        <Card.Body>
          <Table responsive hover>
            <thead>
              <tr>
                <th>Pet Owner</th>
                <th>Service</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Notes</th>
                {(tabKey === 'requested' || tabKey === 'confirmed') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{appointment.petOwner?.email || 'Unknown'}</td>
                  <td>{appointment.service?.name || 'Unknown Service'}</td>
                  <td>
                    {formatAppointmentDate(appointment.appointmentTime)}
                    <div className="small text-muted">
                      Duration: {appointment.service?.estimatedDurationMinutes} min
                    </div>
                  </td>
                  <td>{getStatusBadge(appointment.status)}</td>
                  <td>
                    {appointment.notes ? (
                      <div style={{ maxWidth: '200px', whiteSpace: 'pre-wrap' }}>
                        {appointment.notes}
                      </div>
                    ) : (
                      <span className="text-muted">No notes</span>
                    )}
                  </td>
                  {tabKey === 'requested' && (
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleStatusUpdate(appointment._id, 'Confirmed')}
                        disabled={isLoading}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </td>
                  )}
                  {tabKey === 'confirmed' && (
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleStatusUpdate(appointment._id, 'Completed')}
                        disabled={isLoading}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleStatusUpdate(appointment._id, 'Cancelled')}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  }
};

export default ProviderAppointmentsPage; 