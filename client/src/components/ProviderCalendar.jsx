import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { Container, Row, Col, Card, Spinner, Alert, Button, Modal } from 'react-bootstrap';
import { getMyAppointmentsProvider, getMyAvailability } from '../services/api';
import AppointmentDetailModal from './AppointmentDetailModal';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Setup date-fns localizer
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const ProviderCalendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // Calendar event sources
  const [calendarEvents, setCalendarEvents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  // Whenever appointments or availability changes, update calendar events
  useEffect(() => {
    const events = [];
    
    // Add appointments as events
    if (appointments.length > 0) {
      appointments.forEach(appointment => {
        const start = new Date(appointment.appointmentTime);
        const end = new Date(appointment.estimatedEndTime);
        
        const eventColor = getEventColor(appointment.status);
        
        events.push({
          id: appointment._id,
          title: `${appointment.service?.name || 'Appointment'} - ${appointment.petOwner?.email || 'Unknown'}`,
          start,
          end,
          status: appointment.status,
          resource: appointment,
          allDay: false,
          style: {
            backgroundColor: eventColor.bg,
            color: eventColor.text,
            borderColor: eventColor.border
          }
        });
      });
    }
    
    // Add availability blocks as events if they exist
    if (availability && availability.weeklySchedule) {
      // Current view's start date (beginning of week, using date-fns)
      const currentWeekStart = startOfWeek(viewDate, { locales }); 
      
      // Add each day's availability as events
      availability.weeklySchedule.forEach(daySchedule => {
        if (daySchedule.isAvailable) {
          // Calculate the date for this day in the current view week (using date-fns)
          const dayIndex = daySchedule.dayOfWeek; // Assuming 0 = Sunday, 1 = Monday...
          const dayDate = new Date(currentWeekStart);
          dayDate.setDate(currentWeekStart.getDate() + dayIndex);

          // Parse start and end times (assuming HH:mm format)
          try {
            const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
            const [endHours, endMinutes] = daySchedule.endTime.split(':').map(Number);
            
            // Create availability block event
            const availabilityStart = new Date(dayDate);
            availabilityStart.setHours(startHours, startMinutes, 0, 0);

            const availabilityEnd = new Date(dayDate);
            availabilityEnd.setHours(endHours, endMinutes, 0, 0);
            
            events.push({
              id: `availability-${daySchedule.dayOfWeek}`,
              title: 'Available Hours',
              start: availabilityStart,
              end: availabilityEnd,
              allDay: false,
              resource: { type: 'availability' },
              style: {
                backgroundColor: 'rgba(200, 230, 201, 0.5)', // Light green with transparency
                color: '#1b5e20',
                borderColor: '#81c784',
                opacity: 0.7
              }
            });
          } catch (parseError) {
            console.error("Error parsing availability time:", daySchedule.startTime, daySchedule.endTime, parseError);
          }
        }
      });
    }
    
    setCalendarEvents(events);
  }, [appointments, availability, viewDate]);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Fetch all appointments (regardless of status)
      const allAppointmentPromises = [
        getMyAppointmentsProvider('Requested'),
        getMyAppointmentsProvider('Confirmed'),
        getMyAppointmentsProvider('Completed'),
        getMyAppointmentsProvider('Cancelled'),
        getMyAppointmentsProvider('CancelledByOwner')
      ];
      
      const [
        requestedResponse,
        confirmedResponse,
        completedResponse,
        cancelledResponse,
        cancelledByOwnerResponse
      ] = await Promise.all(allAppointmentPromises);
      
      // Combine all appointment data
      const allAppointments = [
        ...requestedResponse.success ? requestedResponse.data : [],
        ...confirmedResponse.success ? confirmedResponse.data : [],
        ...completedResponse.success ? completedResponse.data : [],
        ...cancelledResponse.success ? cancelledResponse.data : [],
        ...cancelledByOwnerResponse.success ? cancelledByOwnerResponse.data : []
      ];
      
      setAppointments(allAppointments);
      
      // Fetch availability data
      const availabilityResponse = await getMyAvailability();
      if (availabilityResponse.success) {
        setAvailability(availabilityResponse.data);
      }
    } catch (err) {
      setError('Failed to load calendar data. Please try again.');
      console.error('Error fetching calendar data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventColor = (status) => {
    switch (status) {
      case 'Requested':
        return { bg: '#cfe8fc', text: '#0d47a1', border: '#2196f3' }; // Blue
      case 'Confirmed':
        return { bg: '#c8e6c9', text: '#1b5e20', border: '#4caf50' }; // Green
      case 'Completed':
        return { bg: '#d7ccc8', text: '#3e2723', border: '#795548' }; // Brown
      case 'Cancelled':
      case 'CancelledByOwner':
        return { bg: '#ffcdd2', text: '#b71c1c', border: '#e57373' }; // Red
      default:
        return { bg: '#f5f5f5', text: '#212121', border: '#9e9e9e' }; // Grey
    }
  };

  const handleSelectEvent = (event) => {
    // Only handle click for appointment events, not availability blocks
    if (event.resource && event.resource.type !== 'availability') {
      setSelectedAppointment(event.resource);
      setShowDetailModal(true);
    }
  };

  const handleNavigate = (date) => {
    setViewDate(date);
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        ...event.style
      }
    };
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-3">Loading your calendar...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      {error && (
        <Alert variant="danger" className="mb-4">{error}</Alert>
      )}
      
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Appointment Calendar</Card.Title>
              
              <div style={{ height: 700 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: '100%' }}
                  onSelectEvent={handleSelectEvent}
                  onNavigate={handleNavigate}
                  eventPropGetter={eventStyleGetter}
                  views={['month', 'week', 'day']}
                  defaultView="week"
                  tooltipAccessor={event => event.title}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Appointment Detail Modal */}
      <AppointmentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        appointmentId={selectedAppointment?._id}
      />
    </Container>
  );
};

export default ProviderCalendar; 