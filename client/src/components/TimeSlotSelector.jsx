import { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

const TimeSlotSelector = ({ 
  providerAvailability, 
  serviceDuration, 
  onTimeSelected, 
  isLoading 
}) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [error, setError] = useState('');

  // Function to generate available time slots based on provider's availability
  useEffect(() => {
    if (!selectedDate || !providerAvailability?.weeklySchedule || !serviceDuration) {
      setAvailableSlots([]);
      return;
    }

    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    
    // Find the day's schedule
    const daySchedule = providerAvailability.weeklySchedule.find(
      schedule => schedule.dayOfWeek === dayOfWeek && schedule.isAvailable
    );
    
    if (!daySchedule) {
      setError('The provider is not available on this day.');
      setAvailableSlots([]);
      return;
    }
    
    setError('');
    
    // Parse start and end times
    const parseTimeString = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return { hours, minutes };
    };
    
    const startTime = parseTimeString(daySchedule.startTime);
    const endTime = parseTimeString(daySchedule.endTime);
    
    // Calculate available time slots (30-minute intervals)
    const slots = [];
    let currentHour = startTime.hours;
    let currentMinute = startTime.minutes;
    
    // Round to nearest 30-minute slot if needed
    if (currentMinute > 0 && currentMinute < 30) {
      currentMinute = 30;
    } else if (currentMinute > 30) {
      currentHour += 1;
      currentMinute = 0;
    }
    
    const serviceHours = Math.floor(serviceDuration / 60);
    const serviceMinutes = serviceDuration % 60;
    
    // Loop through the day and create slots
    while (
      currentHour < endTime.hours || 
      (currentHour === endTime.hours && currentMinute <= endTime.minutes - serviceMinutes)
    ) {
      // Check if adding service duration exceeds end time
      let slotEndHour = currentHour;
      let slotEndMinute = currentMinute + serviceMinutes;
      
      if (slotEndMinute >= 60) {
        slotEndHour += 1;
        slotEndMinute -= 60;
      }
      
      slotEndHour += serviceHours;
      
      if (
        slotEndHour < endTime.hours || 
        (slotEndHour === endTime.hours && slotEndMinute <= endTime.minutes)
      ) {
        // Format the time for display
        const formattedStartTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        slots.push(formattedStartTime);
      }
      
      // Move to next slot (30-minute intervals)
      if (currentMinute === 30) {
        currentHour += 1;
        currentMinute = 0;
      } else {
        currentMinute = 30;
      }
    }
    
    setAvailableSlots(slots);
    if (slots.length === 0) {
      setError('No available time slots found for this service duration.');
    }
  }, [selectedDate, providerAvailability, serviceDuration]);

  // Handle date selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot('');
  };

  // Handle time slot selection
  const handleSlotChange = (e) => {
    setSelectedSlot(e.target.value);
  };

  // Handle submission
  const handleSubmit = () => {
    if (!selectedDate || !selectedSlot) {
      setError('Please select both a date and a time slot.');
      return;
    }
    
    const appointmentDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedSlot.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);
    
    onTimeSelected(appointmentDateTime.toISOString());
  };

  // Get min and max selectable dates
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  
  const maxDate = new Date();
  maxDate.setMonth(today.getMonth() + 3); // Allow booking up to 3 months in advance
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="time-slot-selector mt-3">
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>Select Date</Form.Label>
        <Form.Control
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          min={minDate}
          max={maxDateStr}
          required
        />
      </Form.Group>
      
      {selectedDate && (
        <Form.Group className="mb-3">
          <Form.Label>Select Time</Form.Label>
          {availableSlots.length > 0 ? (
            <Form.Select
              value={selectedSlot}
              onChange={handleSlotChange}
              required
            >
              <option value="">Select a time slot</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </Form.Select>
          ) : (
            <Alert variant="info">
              {error || "Please select a date first."}
            </Alert>
          )}
        </Form.Group>
      )}
      
      <Button 
        variant="primary" 
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedSlot || isLoading}
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
            Loading...
          </>
        ) : (
          'Select This Time'
        )}
      </Button>
    </div>
  );
};

TimeSlotSelector.propTypes = {
  providerAvailability: PropTypes.shape({
    weeklySchedule: PropTypes.arrayOf(
      PropTypes.shape({
        dayOfWeek: PropTypes.number.isRequired,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        isAvailable: PropTypes.bool.isRequired,
      })
    ).isRequired,
  }),
  serviceDuration: PropTypes.number.isRequired,
  onTimeSelected: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

TimeSlotSelector.defaultProps = {
  isLoading: false,
};

export default TimeSlotSelector; 