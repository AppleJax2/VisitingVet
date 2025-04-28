import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, Alert, Tabs, Tab, Modal, Form } from 'react-bootstrap';
import { getMyAppointmentsProvider, updateAppointmentStatus } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import AppointmentDetailModal from '../components/AppointmentDetailModal';
import ProviderCalendar from '../components/ProviderCalendar';
import { useAuth } from '../contexts/AuthContext';

const ProviderAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('requested');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // State for appointment details modal
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State for appointment completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState({
    appointmentId: null,
    completionNotes: '',
    followUpRecommended: false,
    followUpNotes: ''
  });
  
  // State for appointment cancellation modal
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [cancellationData, setCancellationData] = useState({
    appointmentId: null,
    cancellationReason: ''
  });
  
  // State to track if status update is in progress
  const [isUpdating, setIsUpdating] = useState(false);

  // Format date function
  const formatAppointmentDate = (dateString) => {
    if (!dateString) return '';
    try {
      return formatDate(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch (e) {
      const date = new Date(dateString);
      return date.toLocaleString();
    }
  };

  // Fetch appointments when the component mounts, tab changes, or user becomes available
  useEffect(() => {
    // Ensure user is loaded and is a provider before fetching
    if (!authLoading && user) {
      if (user.role !== 'MVSProvider') {
        // Redirect if user is not a provider
        navigate('/dashboard');
      } else {
        // User is authenticated and is a provider, fetch appointments
        fetchAppointments();
      }
    } else if (!authLoading && !user) {
        // If not loading and no user, redirect to login
        navigate('/login');
    }
    // Dependency array includes user state and activeTab
  }, [user, authLoading, navigate, activeTab]);

  // Function to fetch appointments based on status
  const fetchAppointments = async () => {
    setLocalLoading(true);
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
        const completedData = await getMyAppointmentsProvider('Completed');
        const cancelledData = await getMyAppointmentsProvider('Cancelled');
        const cancelledByOwnerData = await getMyAppointmentsProvider('CancelledByOwner');
        
        const allPastAppointments = [
          ...(completedData?.success ? completedData.data : []),
          ...(cancelledData?.success ? cancelledData.data : []),
          ...(cancelledByOwnerData?.success ? cancelledByOwnerData.data : [])
        ];
        
        // Sort by appointment time, most recent first
        allPastAppointments.sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime));
        
        setAppointments(allPastAppointments);
        setLocalLoading(false);
        return;
      } else if (activeTab === 'calendar') {
        // Calendar tab doesn't need to fetch appointments here
        setLocalLoading(false);
        return;
      }
      
      // Fetch appointments with the selected status
      const response = await getMyAppointmentsProvider(status);
      if (response?.success) {
        // Sort by appointment time
        const sortedAppointments = [...(response.data || [])].sort(
          (a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)
        );
        setAppointments(sortedAppointments);
      }
    } catch (err) {
      setError('Failed to load appointments. Please try again.');
      console.error(err);
    } finally {
      setLocalLoading(false);
    }
  };

  // Function to handle standard status update (Confirm)
  const handleSimpleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      setIsUpdating(true);
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
      setIsUpdating(false);
    }
  };

  // Function to handle completion modal open
  const handleOpenCompletionModal = (appointmentId) => {
    setCompletionData({
      appointmentId,
      completionNotes: '',
      followUpRecommended: false,
      followUpNotes: ''
    });
    setShowCompletionModal(true);
  };

  // Function to handle cancellation modal open
  const handleOpenCancellationModal = (appointmentId) => {
    setCancellationData({
      appointmentId,
      cancellationReason: ''
    });
    setShowCancellationModal(true);
  };

  // Function to handle appointment completion submission
  const handleCompleteAppointment = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setUpdateSuccess('');
      
      const { appointmentId, completionNotes, followUpRecommended, followUpNotes } = completionData;
      
      const response = await updateAppointmentStatus(appointmentId, 'Completed', {
        completionNotes,
        followUpRecommended,
        followUpNotes: followUpRecommended ? followUpNotes : ''
      });
      
      if (response.success) {
        setUpdateSuccess('Appointment marked as completed successfully!');
        setShowCompletionModal(false);
        // Refresh the appointments list
        fetchAppointments();
      }
    } catch (err) {
      setError('Failed to complete appointment. Please try again.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to handle appointment cancellation submission
  const handleCancelAppointment = async () => {
    try {
      setIsUpdating(true);
      setError('');
      setUpdateSuccess('');
      
      const { appointmentId, cancellationReason } = cancellationData;
      
      const response = await updateAppointmentStatus(appointmentId, 'Cancelled', {
        cancellationReason
      });
      
      if (response.success) {
        setUpdateSuccess('Appointment cancelled successfully!');
        setShowCancellationModal(false);
        // Refresh the appointments list
        fetchAppointments();
      }
    } catch (err) {
      setError('Failed to cancel appointment. Please try again.');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to handle view appointment details
  const handleViewDetails = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowDetailModal(true);
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
      case 'CancelledByOwner':
        return <Badge bg="warning">Cancelled by Owner</Badge>;
      case 'Completed':
        return <Badge bg="secondary">Completed</Badge>;
      default:
        return <Badge bg="light" text="dark">{status}</Badge>;
    }
  };

  if (authLoading) {
    return (
        <Container className="mt-4 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading user data...</p>
        </Container>
    );
  }
  
  return (
    <Container className="mt-4">
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
        <Tab eventKey="calendar" title="Calendar View">
          <ProviderCalendar />
        </Tab>
      </Tabs>
      
      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        appointmentId={selectedAppointmentId}
      />
      
      {/* Appointment Completion Modal */}
      <Modal show={showCompletionModal} onHide={() => setShowCompletionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complete Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Completion Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={completionData.completionNotes}
                onChange={(e) => setCompletionData({
                  ...completionData,
                  completionNotes: e.target.value
                })}
                placeholder="Enter any notes about the completed appointment"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Follow-up Recommended"
                checked={completionData.followUpRecommended}
                onChange={(e) => setCompletionData({
                  ...completionData,
                  followUpRecommended: e.target.checked
                })}
              />
            </Form.Group>
            
            {completionData.followUpRecommended && (
              <Form.Group className="mb-3">
                <Form.Label>Follow-up Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={completionData.followUpNotes}
                  onChange={(e) => setCompletionData({
                    ...completionData,
                    followUpNotes: e.target.value
                  })}
                  placeholder="Enter details about the recommended follow-up"
                />
              </Form.Group>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompletionModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCompleteAppointment}
            disabled={isUpdating}
          >
            {isUpdating ? 'Saving...' : 'Mark as Completed'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Appointment Cancellation Modal */}
      <Modal show={showCancellationModal} onHide={() => setShowCancellationModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this appointment?</p>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancellationData.cancellationReason}
              onChange={(e) => setCancellationData({
                ...cancellationData,
                cancellationReason: e.target.value
              })}
              placeholder="Please provide a reason for cancellation"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancellationModal(false)}>
            Close
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelAppointment}
            disabled={isUpdating}
          >
            {isUpdating ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );

  function renderAppointmentsTable(tabKey) {
    if (localLoading) {
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
                <th>Actions</th>
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
                        {appointment.notes.length > 50 
                          ? `${appointment.notes.substring(0, 50)}...` 
                          : appointment.notes}
                      </div>
                    ) : (
                      <span className="text-muted">No notes</span>
                    )}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2 mb-1"
                      onClick={() => handleViewDetails(appointment._id)}
                    >
                      View Details
                    </Button>
                    
                    {tabKey === 'requested' && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2 mb-1"
                          onClick={() => handleSimpleStatusUpdate(appointment._id, 'Confirmed')}
                          disabled={isUpdating}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => handleOpenCancellationModal(appointment._id)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    {tabKey === 'confirmed' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="me-2 mb-1"
                          onClick={() => handleOpenCompletionModal(appointment._id)}
                          disabled={isUpdating}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          className="mb-1"
                          onClick={() => handleOpenCancellationModal(appointment._id)}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </td>
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