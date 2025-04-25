import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge, Button, Modal, Form } from 'react-bootstrap';
import { getMyPetOwnerAppointments, cancelAppointmentByPetOwner, checkAuthStatus } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import AppointmentDetailModal from '../components/AppointmentDetailModal';

const statusVariants = {
  Requested: 'warning',
  Confirmed: 'success',
  Cancelled: 'danger',
  Completed: 'info'
};

const MyPetOwnerAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState('');
  const navigate = useNavigate();
  
  // State for appointment details modal
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // State for cancellation modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  useEffect(() => {
    const verifyUserAndFetchData = async () => {
      try {
        const data = await checkAuthStatus();
        if (!data || !data.success) {
          navigate('/login');
          return;
        }
        
        if (data.user.role !== 'PetOwner') {
          navigate('/dashboard');
          return;
        }
        
        fetchAppointments();
      } catch (err) {
        console.error(err);
        setError('Authentication failed. Please log in again.');
        navigate('/login');
      }
    };
    
    verifyUserAndFetchData();
  }, [navigate]);

  // Function to fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');
      setCancelSuccess('');
      
      const response = await getMyPetOwnerAppointments();
      if (response.success) {
        setAppointments(response.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Prepare appointments for display by status
  const appointmentsByStatus = {
    upcoming: appointments.filter(
      app => ['Requested', 'Confirmed'].includes(app.status)
    ).sort((a, b) => new Date(a.appointmentTime) - new Date(b.appointmentTime)),
    
    past: appointments.filter(
      app => ['Completed', 'Cancelled', 'CancelledByOwner'].includes(app.status)
    ).sort((a, b) => new Date(b.appointmentTime) - new Date(a.appointmentTime))
  };

  // Handle opening cancellation modal
  const handleOpenCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    
    setCancellingAppointment(true);
    try {
      const response = await cancelAppointmentByPetOwner(
        appointmentToCancel._id,
        cancellationReason
      );
      
      if (response.success) {
        setCancelSuccess('Your appointment has been cancelled successfully.');
        setShowCancelModal(false);
        
        // Update the appointment in our state
        setAppointments(appointments.map(app => 
          app._id === appointmentToCancel._id 
          ? { ...app, status: 'CancelledByOwner', cancellationReason }
          : app
        ));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to cancel appointment. ' + (err.error || 'Please try again.'));
    } finally {
      setCancellingAppointment(false);
    }
  };

  // Handle opening details modal
  const handleViewDetails = (appointmentId) => {
    setSelectedAppointmentId(appointmentId);
    setShowDetailModal(true);
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1>My Appointments</h1>
          <p className="text-muted">View and manage your veterinary appointments</p>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      
      {cancelSuccess && (
        <Alert variant="success" dismissible onClose={() => setCancelSuccess('')}>
          {cancelSuccess}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3">Loading your appointments...</p>
        </div>
      ) : (
        <>
          {appointments.length === 0 ? (
            <Card className="mb-4">
              <Card.Body className="text-center py-5">
                <h4>No appointments found</h4>
                <p className="text-muted">
                  You haven't requested any appointments yet. 
                  Browse our providers to schedule your first appointment.
                </p>
                <Button variant="primary" onClick={() => navigate('/search-providers')}>
                  Find a Vet
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Header>
                  <h4 className="mb-0">Upcoming Appointments</h4>
                </Card.Header>
                <Card.Body>
                  {appointmentsByStatus.upcoming.length === 0 ? (
                    <p className="text-center text-muted py-3">No upcoming appointments</p>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsByStatus.upcoming.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              {appointment.providerProfile?.user?.email || 'Unknown Provider'}
                            </td>
                            <td>{appointment.service?.name || 'Unknown Service'}</td>
                            <td>{formatDate(appointment.appointmentTime)}</td>
                            <td>
                              <Badge bg={statusVariants[appointment.status] || 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewDetails(appointment._id)}
                              >
                                Details
                              </Button>
                              {appointment.status === 'Requested' || appointment.status === 'Confirmed' ? (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleOpenCancelModal(appointment)}
                                >
                                  Cancel
                                </Button>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header>
                  <h4 className="mb-0">Past Appointments</h4>
                </Card.Header>
                <Card.Body>
                  {appointmentsByStatus.past.length === 0 ? (
                    <p className="text-center text-muted py-3">No past appointments</p>
                  ) : (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Provider</th>
                          <th>Service</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointmentsByStatus.past.map((appointment) => (
                          <tr key={appointment._id}>
                            <td>
                              {appointment.providerProfile?.user?.email || 'Unknown Provider'}
                            </td>
                            <td>{appointment.service?.name || 'Unknown Service'}</td>
                            <td>{formatDate(appointment.appointmentTime)}</td>
                            <td>
                              <Badge bg={statusVariants[appointment.status] || 'secondary'}>
                                {appointment.status === 'CancelledByOwner' ? 'Cancelled by You' : appointment.status}
                              </Badge>
                            </td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleViewDetails(appointment._id)}
                              >
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            </>
          )}
        </>
      )}
      
      {/* Appointment Details Modal */}
      <AppointmentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        appointmentId={selectedAppointmentId}
      />
      
      {/* Cancellation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this appointment?</p>
          {appointmentToCancel && (
            <div className="mb-3">
              <p className="mb-1"><strong>Service:</strong> {appointmentToCancel.service?.name}</p>
              <p className="mb-1"><strong>Date & Time:</strong> {formatDate(appointmentToCancel.appointmentTime)}</p>
              <p className="mb-0"><strong>Provider:</strong> {appointmentToCancel.providerProfile?.user?.email}</p>
            </div>
          )}
          
          <Form.Group>
            <Form.Label>Reason for cancellation (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancellation"
            />
          </Form.Group>
          
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelAppointment}
            disabled={cancellingAppointment}
          >
            {cancellingAppointment ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyPetOwnerAppointmentsPage; 