import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { updateReminder, fetchUserPets } from '../services/api';

function ReminderEditModal({ show, onHide, reminder, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [userPets, setUserPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || '',
        description: reminder.description || '',
        dueDate: reminder.dueDate ? new Date(reminder.dueDate).toISOString().split('T')[0] : '',
        priority: reminder.priority || 'medium',
        petId: reminder.pet?._id || '', // Use pet._id if populated, otherwise empty
        isComplete: reminder.isComplete || false,
      });
    } else {
      setFormData({});
    }
    setError('');
    // Fetch pets only when modal opens
    if(show) loadPets(); 
  }, [reminder, show]);

  const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await fetchUserPets();
        if (response.success) {
          setUserPets(response.pets || []);
        } else {
          console.warn('Could not load pets for reminder edit form.');
        }
      } catch (err) {
        console.error('Error loading pets for reminder edit form:', err);
      } finally {
        setLoadingPets(false);
      }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.title || !formData.dueDate) {
      setError('Title and due date are required.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      payload.pet = payload.petId === '' ? null : payload.petId; // Send pet (null or ID), not petId
      delete payload.petId;

      const result = await updateReminder(reminder._id, payload);
      if (result.success) {
        onUpdate(result.reminder); // Pass updated reminder back
        onHide();
      } else {
        setError(result.error || 'Failed to update reminder.');
      }
    } catch (err) {
      console.error('Error updating reminder:', err);
      setError(err.message || 'An error occurred while updating the reminder.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Reminder: {reminder?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
        
        {!isLoading && reminder && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="editReminderTitle">
              <Form.Label>Title*</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editReminderDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editReminderDueDate">
                  <Form.Label>Due Date*</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editReminderPriority">
                  <Form.Label>Priority</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="editReminderPet">
              <Form.Label>Link to Pet</Form.Label>
              <Form.Select
                name="petId"
                value={formData.petId}
                onChange={handleChange}
                disabled={loadingPets}
              >
                <option value="">None</option>
                {userPets.map(pet => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name} ({pet.species})
                  </option>
                ))}
              </Form.Select>
              {loadingPets && <Form.Text className="text-muted">Loading pets...</Form.Text>}
            </Form.Group>
            
             <Form.Group className="mb-3" controlId="editReminderComplete">
              <Form.Check 
                type="checkbox"
                label="Mark as Complete"
                name="isComplete"
                checked={formData.isComplete}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={onHide} className="me-2">
                    Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Save Changes'}
                </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ReminderEditModal; 