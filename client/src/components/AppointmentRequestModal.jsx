import { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import TimeSlotSelector from './TimeSlotSelector';
import { requestAppointment, getProviderAvailability } from '../services/api';

const AppointmentRequestModal = ({ show, onHide, service, providerProfileId }) => {
  const [providerAvailability, setProviderAvailability] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch provider availability when modal opens
  useEffect(() => {
    if (show && providerProfileId) {
      const fetchAvailability = async () => {
        setIsAvailabilityLoading(true);
        setError('');
        try {
          const response = await getProviderAvailability(providerProfileId);
          setProviderAvailability(response.data);
        } catch (err) {
          setError('Failed to load provider availability. Please try again.');
          console.error('Error fetching provider availability:', err);
        } finally {
          setIsAvailabilityLoading(false);
        }
      };

      fetchAvailability();
    }
  }, [show, providerProfileId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!show) {
      setSelectedTime(null);
      setNotes('');
      setError('');
      setSuccess(false);
    }
  }, [show]);

  const handleTimeSelected = (dateTimeIso) => {
    setSelectedTime(dateTimeIso);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedTime) {
      setError('Please select a date and time for your appointment.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await requestAppointment({
        providerProfileId,
        serviceId: service._id,
        appointmentTime: selectedTime,
        notes: notes.trim()
      });
      
      setSuccess(true);
      // Reset form but keep the modal open to show success message
      setSelectedTime(null);
      setNotes('');
    } catch (err) {
      setError(err.error || 'Failed to request appointment. Please try again.');
      console.error('Error requesting appointment:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // If appointment was successfully booked, close the modal
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Request Appointment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success ? (
          <Alert variant="success">
            Your appointment request has been submitted successfully! The provider will review your request and confirm or suggest an alternative time.
          </Alert>
        ) : (
          <>
            <div className="mb-3">
              <h5>{service?.name}</h5>
              <p className="text-muted">
                {service?.description}
              </p>
              <p>
                <strong>Duration:</strong> {service?.estimatedDurationMinutes} minutes<br />
                <strong>Price:</strong> ${service?.price} ({service?.priceType})
              </p>
            </div>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            {isAvailabilityLoading ? (
              <div className="text-center py-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading provider availability...</p>
              </div>
            ) : (
              <>
                <TimeSlotSelector
                  providerAvailability={providerAvailability}
                  serviceDuration={service?.estimatedDurationMinutes || 30}
                  onTimeSelected={handleTimeSelected}
                  isLoading={isLoading}
                />
                
                <Form.Group className="mb-3 mt-4">
                  <Form.Label>Additional Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Please provide any additional information that might be helpful for your appointment..."
                    maxLength={500}
                  />
                  <Form.Text className="text-muted">
                    {500 - notes.length} characters remaining
                  </Form.Text>
                </Form.Group>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={!selectedTime || isLoading}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />{' '}
                Requesting...
              </>
            ) : (
              'Request Appointment'
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

AppointmentRequestModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  service: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    estimatedDurationMinutes: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    priceType: PropTypes.string.isRequired,
  }),
  providerProfileId: PropTypes.string.isRequired,
};

export default AppointmentRequestModal; 