import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { addPet } from '../services/api';

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
      
      setSuccess(`Pet "${petData.name}" added successfully!`);
      // Optionally reset form or navigate away
      // setPetData({ name: '', species: '', breed: '', age: '' }); 
      // Redirect to the My Pets page specifically
      navigate('/my-pets', { state: { successMessage: `Pet "${petData.name}" added successfully!` } }); 

    } catch (err) {
      console.error('Error adding pet:', err);
      setError(err.message || 'Failed to add pet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="p-4 p-md-5 shadow-sm border-0">
            <Card.Body>
              <h2 className="text-center fw-semibold mb-4">Add New Pet</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formPetName">
                  <Form.Label>Pet Name<span className="text-danger ms-1">*</span></Form.Label>
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
                  <Form.Label>Species<span className="text-danger ms-1">*</span></Form.Label>
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
                  <Form.Label>Breed<span className="text-danger ms-1">*</span></Form.Label>
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
                  <Form.Label>Age (Years)<span className="text-danger ms-1">*</span></Form.Label>
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
                    size="lg"
                  >
                    {isLoading ? (
                      <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>Adding Pet...</>
                     ) : 'Add Pet'}
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