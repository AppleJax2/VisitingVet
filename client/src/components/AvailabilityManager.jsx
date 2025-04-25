import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Table } from 'react-bootstrap';
import { getMyAvailability, updateAvailability } from '../services/api';

const AvailabilityManager = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availability, setAvailability] = useState({
    weeklySchedule: [],
    specialDates: []
  });

  const days = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  // Initialize empty schedule for each day of the week
  useEffect(() => {
    const initializeSchedule = () => {
      // If no existing schedule, create an empty one
      if (availability.weeklySchedule.length === 0) {
        const initialSchedule = days.map(day => ({
          dayOfWeek: day.value,
          startTime: '',
          endTime: '',
          isAvailable: false
        }));
        setAvailability(prev => ({ ...prev, weeklySchedule: initialSchedule }));
      }
    };

    initializeSchedule();
  }, []);

  // Fetch provider's current availability
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await getMyAvailability();
        if (response.success) {
          if (response.data && response.data.weeklySchedule) {
            // Sort by day of week
            const sortedSchedule = [...response.data.weeklySchedule].sort(
              (a, b) => a.dayOfWeek - b.dayOfWeek
            );
            
            // If we don't have all 7 days, fill in the missing ones
            const existingDays = sortedSchedule.map(day => day.dayOfWeek);
            const missingDays = days
              .filter(day => !existingDays.includes(day.value))
              .map(day => ({
                dayOfWeek: day.value,
                startTime: '',
                endTime: '',
                isAvailable: false
              }));
            
            const completeSchedule = [...sortedSchedule, ...missingDays].sort(
              (a, b) => a.dayOfWeek - b.dayOfWeek
            );
            
            setAvailability({
              weeklySchedule: completeSchedule,
              specialDates: response.data.specialDates || []
            });
          } else {
            // Initialize with empty schedule
            const initialSchedule = days.map(day => ({
              dayOfWeek: day.value,
              startTime: '',
              endTime: '',
              isAvailable: false
            }));
            setAvailability(prev => ({ ...prev, weeklySchedule: initialSchedule }));
          }
        }
      } catch (err) {
        // If no availability exists yet, that's okay
        if (err.message !== 'Failed to get availability') {
          setError('Failed to load availability data.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  // Handle toggling availability for a day
  const handleAvailabilityToggle = (dayIndex) => {
    const updatedSchedule = [...availability.weeklySchedule];
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      isAvailable: !updatedSchedule[dayIndex].isAvailable
    };
    
    // If toggling on, set default times if empty
    if (updatedSchedule[dayIndex].isAvailable) {
      if (!updatedSchedule[dayIndex].startTime) {
        updatedSchedule[dayIndex].startTime = '09:00';
      }
      if (!updatedSchedule[dayIndex].endTime) {
        updatedSchedule[dayIndex].endTime = '17:00';
      }
    }
    
    setAvailability({ ...availability, weeklySchedule: updatedSchedule });
  };

  // Handle time changes
  const handleTimeChange = (dayIndex, field, value) => {
    const updatedSchedule = [...availability.weeklySchedule];
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      [field]: value
    };
    setAvailability({ ...availability, weeklySchedule: updatedSchedule });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Filter out days that are not available if they don't have times set
      const filteredSchedule = availability.weeklySchedule.map(day => {
        if (day.isAvailable) {
          return day;
        } else {
          return {
            ...day,
            startTime: '',
            endTime: ''
          };
        }
      });
      
      const response = await updateAvailability({
        weeklySchedule: filteredSchedule,
        specialDates: availability.specialDates
      });
      
      if (response.success) {
        setSuccess('Availability schedule updated successfully!');
      }
    } catch (err) {
      setError('Failed to update availability schedule. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h4>Your Availability Schedule</h4>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Day</th>
                <th>Available</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {availability.weeklySchedule.map((day, index) => (
                <tr key={day.dayOfWeek}>
                  <td>{days.find(d => d.value === day.dayOfWeek)?.label}</td>
                  <td>
                    <Form.Check
                      type="switch"
                      id={`available-${day.dayOfWeek}`}
                      checked={day.isAvailable}
                      onChange={() => handleAvailabilityToggle(index)}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="time"
                      value={day.startTime}
                      onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                      disabled={!day.isAvailable}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="time"
                      value={day.endTime}
                      onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                      disabled={!day.isAvailable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          <div className="mt-3">
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Availability'}
            </Button>
          </div>
        </Form>
        
        <div className="mt-4">
          <h5>Special Dates (Coming Soon)</h5>
          <p className="text-muted">
            You'll soon be able to set special availability for specific dates like holidays or vacations.
          </p>
        </div>
      </Card.Body>
    </Card>
  );
};

export default AvailabilityManager; 