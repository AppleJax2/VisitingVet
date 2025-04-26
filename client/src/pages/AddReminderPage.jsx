import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addReminder, fetchUserPets } from '../services/api';
import theme from '../utils/theme';

function AddReminderPage() {
  const [reminderData, setReminderData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    petId: '', // Optional linked pet
  });
  const [userPets, setUserPets] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const navigate = useNavigate();

  // Fetch user's pets for the dropdown
  useEffect(() => {
    const loadPets = async () => {
      setLoadingPets(true);
      try {
        const response = await fetchUserPets();
        if (response.success) {
          setUserPets(response.pets || []);
        } else {
          console.warn('Could not load pets for reminder form.');
        }
      } catch (err) {
        console.error('Error loading pets for reminder form:', err);
      } finally {
        setLoadingPets(false);
      }
    };
    loadPets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminderData({
      ...reminderData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!reminderData.title || !reminderData.dueDate) {
      setError('Please provide a title and due date.');
      setIsLoading(false);
      return;
    }

    try {
      // Ensure petId is null if empty string is selected
      const payload = { ...reminderData };
      if (payload.petId === '') {
        payload.petId = null;
      }
      
      const result = await addReminder(payload);
      console.log('Reminder added:', result);
      
      setSuccess(`Reminder "${reminderData.title}" added successfully!`);
      // Reset form or navigate away
      // setReminderData({ title: '', description: '', dueDate: '', priority: 'medium', petId: '' });
      navigate('/dashboard'); // Navigate back to dashboard or maybe a Reminders list page?

    } catch (err) {
      console.error('Error adding reminder:', err);
      setError(err.message || 'Failed to add reminder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Styles similar to AddPetPage
  const styles = {
    card: {
      padding: '30px',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: 'none',
      marginTop: '30px',
    },
    title: {
      color: theme.colors.primary.dark,
      marginBottom: '25px',
      fontWeight: '600',
    },
    button: {
      backgroundColor: theme.colors.primary.main,
      borderColor: theme.colors.primary.main,
      padding: '10px 20px',
      fontWeight: '500',
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card style={styles.card}>
            <Card.Body>
              <h2 style={styles.title} className="text-center">Add New Reminder</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formReminderTitle">
                  <Form.Label>Title*</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Flea treatment, Annual vaccination"
                    name="title"
                    value={reminderData.title}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formReminderDescription">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add any notes or details"
                    name="description"
                    value={reminderData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formReminderDueDate">
                      <Form.Label>Due Date*</Form.Label>
                      <Form.Control
                        type="date"
                        name="dueDate"
                        value={reminderData.dueDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="formReminderPriority">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={reminderData.priority}
                        onChange={handleChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4" controlId="formReminderPet">
                  <Form.Label>Link to Pet (Optional)</Form.Label>
                  <Form.Select
                    name="petId"
                    value={reminderData.petId}
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

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                    style={styles.button}
                  >
                    {isLoading ? 'Adding Reminder...' : 'Add Reminder'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AddReminderPage; 