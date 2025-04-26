import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addPet } from '../services/api';
import theme from '../utils/theme';

function AddPetPage() {
  const [petData, setPetData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    // Add other relevant fields: gender, weight, microchipId, medicalHistory, etc.
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData({
      ...petData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Basic Validation (add more robust validation later)
    if (!petData.name || !petData.species || !petData.breed || !petData.age) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    try {
      // Convert age to number before sending
      const dataToSend = {
        ...petData,
        age: Number(petData.age)
      };

      // Call the actual API function
      const result = await addPet(dataToSend); 
      console.log('Pet added:', result);
      
      setSuccess(`Pet "${petData.name}" added successfully!`);
      // Optionally reset form or navigate away
      // setPetData({ name: '', species: '', breed: '', age: '' }); 
      navigate('/dashboard'); // Navigate back to dashboard after success

    } catch (err) {
      console.error('Error adding pet:', err);
      setError(err.message || 'Failed to add pet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Basic styles (consider moving to theme or CSS)
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
              <h2 style={styles.title} className="text-center">Add New Pet</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPetName">
                  <Form.Label>Pet Name*</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter pet's name"
                    name="name"
                    value={petData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPetSpecies">
                  <Form.Label>Species*</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Dog, Cat, Rabbit"
                    name="species"
                    value={petData.species}
                    onChange={handleChange}
                    required
                  />
                  {/* Consider using a Select dropdown for common species */}
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPetBreed">
                  <Form.Label>Breed*</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Golden Retriever, Siamese"
                    name="breed"
                    value={petData.breed}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPetAge">
                  <Form.Label>Age (Years)*</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter pet's age in years"
                    name="age"
                    value={petData.age}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
                
                {/* Add other form fields here (gender, weight, etc.) */}

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                    style={styles.button}
                  >
                    {isLoading ? 'Adding Pet...' : 'Add Pet'}
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

export default AddPetPage; 