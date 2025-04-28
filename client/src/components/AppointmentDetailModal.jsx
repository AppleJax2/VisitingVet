import React, { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Badge, ListGroup, Form } from 'react-bootstrap';
import { CalendarEvent, Clock, GeoAlt, Person, Tag, CardText, CheckCircle, XCircle, ExclamationTriangle, CameraVideo, Film } from 'react-bootstrap-icons';
import { getAppointmentDetails, cancelAppointmentByPetOwner, getRecordingsForRoom, getRecordingAccessLink } from '../services/api';
import { format } from 'date-fns';
import VideoCallFrame from './Video/VideoCallFrame';

function AppointmentDetailModal({ show, onHide, appointmentId, userRole, currentUser, onUpdate }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [recordingError, setRecordingError] = useState('');

  useEffect(() => {
    const loadDetailsAndRecordings = async () => {
      if (!appointmentId) return;
      setLoading(true);
      setLoadingRecordings(true);
      setError('');
      setRecordingError('');
      setCancelError('');
      setShowCancelConfirm(false);
      setShowVideoCall(false);
      setAppointment(null);
      setRecordings([]);
      
      try {
        const apptResponse = await getAppointmentDetails(appointmentId);
        if (apptResponse.success) {
          const appt = apptResponse.data;
          setAppointment(appt);
          
          if (appt.status === 'Completed' && appt.deliveryMethod === 'video') {
              try {
                  const recordingResponse = await getRecordingsForRoom(appt._id);
                  if (recordingResponse.success) {
                      setRecordings(recordingResponse.data || []);
                  } else {
                      console.warn('Failed to fetch recordings:', recordingResponse.error);
                      setRecordingError('Could not retrieve recordings for this appointment.');
                  }
              } catch (recErr) {
                  console.error('Error fetching recordings:', recErr);
                  setRecordingError('An error occurred while fetching recordings.');
              }
          }
        } else {
          setError(apptResponse.error || 'Failed to load appointment details.');
        }
      } catch (err) {
        console.error('Error loading appointment details:', err);
        setError(err.message || 'An error occurred while fetching details.');
      } finally {
        setLoading(false);
        setLoadingRecordings(false);
      }
    };

    if (show) {
      loadDetailsAndRecordings();
    }
    if (!show) {
      setShowVideoCall(false);
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

  const canJoinCall = () => {
    if (!appointment || appointment.deliveryMethod !== 'video' || appointment.status !== 'Confirmed') {
      return false;
    }
    const now = new Date();
    const startTime = new Date(appointment.appointmentTime);
    const timeDiffMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    const endTime = new Date(appointment.estimatedEndTime);
    return timeDiffMinutes <= 15 && now < endTime;
  };
  
  const handleJoinCallClick = () => {
    setShowVideoCall(true);
  };
  
  const handleCallLeft = () => {
    setShowVideoCall(false);
  };

  const handleViewRecording = async (recordingId) => {
      setRecordingError('');
      try {
          const response = await getRecordingAccessLink(recordingId);
          if (response.success && response.accessLink) {
              window.open(response.accessLink, '_blank', 'noopener,noreferrer');
          } else {
              throw new Error(response.error || 'Failed to get recording link.');
          }
      } catch (err) {
           console.error('Error getting recording link:', err);
           setRecordingError(`Failed to get recording link: ${err.message}`);
      }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Appointment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && !loading && <Alert variant="danger">{error}</Alert>}
        
        {appointment && !loading && (
          showVideoCall && currentUser ? (
            <div style={{ height: '60vh', position: 'relative' }}>
              <VideoCallFrame 
                roomName={appointment._id} 
                userName={currentUser.name || 'User'}
                onCallLeft={handleCallLeft}
              />
            </div>
          ) : (
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
                <ListGroup.Item><CameraVideo className="me-2"/> <strong>Delivery:</strong> {appointment.deliveryMethod === 'video' ? 'Video Call' : (appointment.deliveryMethod === 'phone' ? 'Phone Call' : 'In Person')}</ListGroup.Item>
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
                {appointment.status === 'Completed' && appointment.deliveryMethod === 'video' && (
                  <ListGroup.Item>
                    <Film className="me-2"/> <strong>Recordings:</strong>
                    {loadingRecordings && <Spinner size="sm" className="ms-2"/>}
                    {recordingError && <span className="ms-2 text-danger">{recordingError}</span>}
                    {!loadingRecordings && recordings.length === 0 && <span className="ms-2 text-muted">No recordings found.</span>}
                    {!loadingRecordings && recordings.length > 0 && (
                        <ul className="list-unstyled ps-4 mt-1">
                            {recordings.map(rec => (
                                <li key={rec.id}>
                                    <Button variant="link" size="sm" onClick={() => handleViewRecording(rec.id)} title={`View recording from ${format(new Date(rec.start_ts), 'Pp')}`}>
                                        View Recording ({format(new Date(rec.start_ts), 'P p')}) - Duration: {Math.round(rec.duration)}s
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                  </ListGroup.Item>
                )}
              </ListGroup>

              {canJoinCall() && (
                <div className="mt-3 text-center">
                  <Button variant="success" size="lg" onClick={handleJoinCallClick}>
                    <CameraVideo className="me-2"/> Join Video Call Now
                  </Button>
                </div>
              )}

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
          )
        )}
      </Modal.Body>
      <Modal.Footer>
        {canCancel && !showCancelConfirm && !showVideoCall && (
          <Button variant="outline-danger" onClick={() => setShowCancelConfirm(true)}>
            Cancel Appointment
          </Button>
        )}
        <Button variant="secondary" onClick={onHide} disabled={showVideoCall}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AppointmentDetailModal; 