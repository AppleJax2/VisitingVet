import { useState, useEffect } from 'react';
import { Modal, Button, Spinner, Alert, Row, Col, Badge, Card } from 'react-bootstrap';
import { getAppointmentDetails } from '../services/api';
import { formatDate } from '../utils/dateUtils';

const AppointmentDetailModal = ({ show, onHide, appointmentId }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch appointment details when the modal opens
  useEffect(() => {
    if (show && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [show, appointmentId]);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getAppointmentDetails(appointmentId);
      if (response.success) {
        setAppointment(response.data);
      }
    } catch (err) {
      setError('Failed to load appointment details. Please try again.');
      console.error('Error fetching appointment details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const variants = {
      Requested: 'info',
      Confirmed: 'success',
      Cancelled: 'danger',
      CancelledByOwner: 'warning',
      Completed: 'secondary'
    };
    
    return (
      <Badge bg={variants[status] || 'light'}>
        {status === 'CancelledByOwner' ? 'Cancelled by Owner' : status}
      </Badge>
    );
  };

  // Render appointment details
  const renderAppointmentDetails = () => {
    if (!appointment) return null;
    
    const {
      appointmentTime, 
      estimatedEndTime, 
      status, 
      notes,
      service,
      providerProfile,
      animalDetails,
      customFieldResponses,
      cancellationReason,
      cancelledBy,
      cancellationTime,
      completionNotes,
      followUpRecommended,
      followUpNotes
    } = appointment;
    
    return (
      <>
        <Row className="mb-3">
          <Col md={6}>
            <h5 className="mb-1">Service Details</h5>
            <p className="mb-0"><strong>Service:</strong> {service?.name || 'Unknown Service'}</p>
            <p className="mb-0"><strong>Description:</strong> {service?.description || 'No description'}</p>
            <p className="mb-0">
              <strong>Price:</strong> {service?.price ? formatPrice(service.price) : 'Contact for pricing'}
            </p>
            <p className="mb-0">
              <strong>Duration:</strong> {service?.estimatedDurationMinutes || 0} minutes
            </p>
            <p className="mb-0">
              <strong>Animal Type:</strong> {service?.animalType || 'Not specified'}
            </p>
          </Col>
          <Col md={6}>
            <h5 className="mb-1">Provider Details</h5>
            <p className="mb-0">
              <strong>Email:</strong> {providerProfile?.user?.email || 'Unknown'}
            </p>
            <p className="mb-0">
              <strong>Business:</strong> {providerProfile?.businessName || 'Individual Practice'}
            </p>
            <p className="mb-0">
              <strong>Experience:</strong> {providerProfile?.yearsExperience || 0} years
            </p>
            <p className="mb-0">
              <strong>Animal Types:</strong> {providerProfile?.animalTypes?.join(', ') || 'Not specified'}
            </p>
          </Col>
        </Row>
        
        <Row className="mb-3">
          <Col md={6}>
            <h5 className="mb-1">Appointment Time</h5>
            <p className="mb-0">
              <strong>Start:</strong> {formatDate(appointmentTime, 'MMM dd, yyyy h:mm a')}
            </p>
            <p className="mb-0">
              <strong>End:</strong> {formatDate(estimatedEndTime, 'MMM dd, yyyy h:mm a')}
            </p>
            <p className="mb-0 mt-2">
              <strong>Status:</strong> {getStatusBadge(status)}
            </p>
          </Col>
          <Col md={6}>
            {animalDetails && Object.keys(animalDetails).some(key => animalDetails[key]) && (
              <>
                <h5 className="mb-1">Animal Details</h5>
                {animalDetails.name && <p className="mb-0"><strong>Name:</strong> {animalDetails.name}</p>}
                {animalDetails.type && <p className="mb-0"><strong>Type:</strong> {animalDetails.type}</p>}
                {animalDetails.breed && <p className="mb-0"><strong>Breed:</strong> {animalDetails.breed}</p>}
                {animalDetails.age && <p className="mb-0"><strong>Age:</strong> {animalDetails.age}</p>}
                {animalDetails.weight && <p className="mb-0"><strong>Weight:</strong> {animalDetails.weight}</p>}
              </>
            )}
          </Col>
        </Row>
        
        {/* Notes Section */}
        {notes && (
          <div className="mb-3">
            <h5>Appointment Notes</h5>
            <Card>
              <Card.Body>
                <p className="mb-0">{notes}</p>
              </Card.Body>
            </Card>
          </div>
        )}
        
        {/* Cancellation Details */}
        {(status === 'Cancelled' || status === 'CancelledByOwner') && (
          <div className="mb-3">
            <h5>Cancellation Details</h5>
            <Card bg="light">
              <Card.Body>
                <p className="mb-0"><strong>Cancelled By:</strong> {cancelledBy || 'Unknown'}</p>
                {cancellationTime && (
                  <p className="mb-0">
                    <strong>Cancelled On:</strong> {formatDate(cancellationTime, 'MMM dd, yyyy h:mm a')}
                  </p>
                )}
                {cancellationReason && (
                  <p className="mb-0"><strong>Reason:</strong> {cancellationReason}</p>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
        
        {/* Completion Details */}
        {status === 'Completed' && (
          <div className="mb-3">
            <h5>Completion Details</h5>
            <Card bg="light">
              <Card.Body>
                {completionNotes && (
                  <p className="mb-0"><strong>Notes:</strong> {completionNotes}</p>
                )}
                {followUpRecommended && (
                  <div className="mt-2">
                    <p className="mb-0"><strong>Follow-Up Recommended</strong></p>
                    {followUpNotes && <p className="mb-0">{followUpNotes}</p>}
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        )}
        
        {/* Custom Fields */}
        {customFieldResponses && customFieldResponses.length > 0 && (
          <div className="mb-3">
            <h5>Additional Information</h5>
            <Card>
              <Card.Body>
                {customFieldResponses.map((field, index) => (
                  <p key={index} className="mb-1">
                    <strong>{field.fieldName}:</strong> {field.response}
                  </p>
                ))}
              </Card.Body>
            </Card>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Appointment Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" />
            <p className="mt-2">Loading appointment details...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !appointment ? (
          <Alert variant="info">No appointment information available.</Alert>
        ) : (
          renderAppointmentDetails()
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppointmentDetailModal; 