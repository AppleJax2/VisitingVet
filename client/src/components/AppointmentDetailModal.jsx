import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { CalendarEvent, Clock, GeoAlt, Person, Tag, CardText, CheckCircle, XCircle, ExclamationTriangle } from 'react-bootstrap-icons';
import { getAppointmentDetails, cancelAppointmentByPetOwner } from '../services/api';
import { format } from 'date-fns';
import theme from '../utils/theme';

function AppointmentDetailModal({ show, onHide, appointmentId, userRole, onUpdate }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!appointmentId) return;
      setLoading(true);
      setError('');
      setCancelError('');
      setShowCancelConfirm(false);
      setCancellationReason('');
      try {
        const response = await getAppointmentDetails(appointmentId);
        if (response.success) {
          setAppointment(response.data);
        } else {
          setError(response.error || 'Failed to load appointment details.');
        }
      } catch (err) {
        console.error('Error loading appointment details:', err);
        setError(err.message || 'An error occurred while fetching details.');
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      loadDetails();
    }
  }, [appointmentId, show]);

  const handleCancel = async () => {
    if (!appointment || userRole !== 'PetOwner') return;
    
    setIsCancelling(true);
    setCancelError('');
    try {
      const response = await cancelAppointmentByPetOwner(appointment._id, cancellationReason);
      if (response.success) {
        setAppointment(response.data);
        setShowCancelConfirm(false);
        if (onUpdate) onUpdate(response.data);
      } else {
        setCancelError(response.error || 'Failed to cancel appointment.');
      }
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      setCancelError(err.message || 'An error occurred during cancellation.');
    } finally {
      setIsCancelling(false);
    }
  };

  const renderStatusBadge = (status) => {
    let variant = 'secondary';
    let icon = null;
    switch (status) {
      case 'Confirmed': variant = 'success'; icon = <CheckCircle className="me-1"/>; break;
      case 'Requested': variant = 'warning'; icon = <Clock className="me-1"/>; break;
      case 'Completed': variant = 'info'; icon = <CheckCircle className="me-1"/>; break;
      case 'Cancelled': 
      case 'CancelledByOwner': 
      case 'CancelledByProvider': variant = 'danger'; icon = <XCircle className="me-1"/>; break;
      default: variant = 'secondary';
    }
    return <Badge bg={variant} className="fs-6">{icon}{status}</Badge>;
  };

  const canCancel = appointment && userRole === 'PetOwner' && (
    appointment.status === 'Requested' || appointment.status === 'Confirmed'
  );

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Appointment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        {appointment && !loading && (
          <>
            <Row className="mb-3">
              <Col md={8}>
                <h4>{appointment.service?.name || 'Appointment'}</h4>
                {userRole === 'PetOwner' && 
                  <p className="text-muted mb-0">With: {appointment.providerProfile?.businessName || appointment.providerProfile?.user?.email || 'Provider'}</p>
                }
                {userRole !== 'PetOwner' && 
                  <p className="text-muted mb-0">Client: {appointment.petOwner?.email || 'Client'}</p>
                }
              </Col>
              <Col md={4} className="text-md-end">
                {renderStatusBadge(appointment.status)}
              </Col>
            </Row>

            <ListGroup variant="flush">
              <ListGroup.Item><Person className="me-2"/> <strong>{userRole === 'PetOwner' ? 'Provider' : 'Client'}:</strong> {userRole === 'PetOwner' ? (appointment.providerProfile?.businessName || appointment.providerProfile?.user?.email) : appointment.petOwner?.email}</ListGroup.Item>
              <ListGroup.Item><CalendarEvent className="me-2"/> <strong>Date:</strong> {format(new Date(appointment.appointmentTime), 'PPP')}</ListGroup.Item>
              <ListGroup.Item><Clock className="me-2"/> <strong>Time:</strong> {format(new Date(appointment.appointmentTime), 'p')} (Estimated End: {format(new Date(appointment.estimatedEndTime), 'p')})</ListGroup.Item>
              <ListGroup.Item><Tag className="me-2"/> <strong>Service:</strong> {appointment.service?.name} (${appointment.service?.price})</ListGroup.Item>
              <ListGroup.Item><GeoAlt className="me-2"/> <strong>Location:</strong> {appointment.appointmentLocation || appointment.providerProfile?.serviceArea?.address || 'Provider Address'}</ListGroup.Item>
              {appointment.notes && <ListGroup.Item><CardText className="me-2"/> <strong>Notes:</strong> {appointment.notes}</ListGroup.Item>}
              
              {(appointment.status.startsWith('Cancelled')) && (
                <ListGroup.Item>
                  <ExclamationTriangle className="me-2 text-danger"/> 
                  <strong>Cancelled By:</strong> {appointment.cancelledBy || 'Unknown'} on {format(new Date(appointment.cancellationTime), 'Pp')}
                  {appointment.cancellationReason && <div className="mt-1 ps-4 fst-italic">Reason: {appointment.cancellationReason}</div>}
                </ListGroup.Item>
              )}
              {appointment.status === 'Completed' && (
                <ListGroup.Item>
                  <CheckCircle className="me-2 text-info"/> 
                  <strong>Completion Notes:</strong> {appointment.completionNotes || 'N/A'}
                  {appointment.followUpRecommended && <div className="mt-1 ps-4"><strong>Follow-up Recommended:</strong> {appointment.followUpNotes || 'Yes'}</div>}
                </ListGroup.Item>
              )}
            </ListGroup>

            {showCancelConfirm && (
              <div className="mt-3 p-3 border rounded bg-light">
                <h5>Confirm Cancellation</h5>
                <Form.Group className="mb-2">
                  <Form.Label>Reason for cancellation (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Provide a reason..."
                  />
                </Form.Group>
                {cancelError && <Alert variant="danger" size="sm">{cancelError}</Alert>}
                <Button variant="danger" onClick={handleCancel} disabled={isCancelling} className="me-2">
                  {isCancelling ? <Spinner size="sm"/> : 'Confirm Cancel'}
                </Button>
                <Button variant="secondary" onClick={() => setShowCancelConfirm(false)} disabled={isCancelling}>
                  Keep Appointment
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        {canCancel && !showCancelConfirm && (
          <Button variant="outline-danger" onClick={() => setShowCancelConfirm(true)}>
            Cancel Appointment
          </Button>
        )}
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AppointmentDetailModal; 