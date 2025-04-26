import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { updatePet } from '../services/api';

function PetEditModal({ show, onHide, pet, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize form data when pet prop changes or modal shows
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        age: pet.age || '',
        gender: pet.gender || 'Unknown',
        weight: pet.weight || '',
        weightUnit: pet.weightUnit || 'lbs',
        profileImage: pet.profileImage || '',
        microchipId: pet.microchipId || '',
        medicalHistory: pet.medicalHistory || '',
        lastCheckup: pet.lastCheckup ? new Date(pet.lastCheckup).toISOString().split('T')[0] : '',
      });
    } else {
      // Reset form if no pet is provided (though this shouldn't happen in edit mode)
      setFormData({});
    }
    setError(''); // Clear errors when modal opens or pet changes
  }, [pet, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic Validation
    if (!formData.name || !formData.species || !formData.breed || formData.age === '') {
      setError('Name, species, breed, and age are required.');
      setIsLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      // Ensure age is a number
      payload.age = Number(payload.age);
      if (isNaN(payload.age) || payload.age < 0) {
         setError('Age must be a non-negative number.');
         setIsLoading(false);
         return;
      }
      // Handle optional weight
      payload.weight = payload.weight ? Number(payload.weight) : null;
      // Handle optional lastCheckup date
      payload.lastCheckup = payload.lastCheckup || null;

      const result = await updatePet(pet._id, payload);
      if (result.success) {
        onUpdate(result.pet); // Pass the updated pet data back to the parent
        onHide(); // Close the modal
      } else {
        setError(result.error || 'Failed to update pet.');
      }
    } catch (err) {
      console.error('Error updating pet:', err);
      setError(err.message || 'An error occurred while updating the pet.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Pet: {pet?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
        
        {!isLoading && pet && (
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editPetName">
                  <Form.Label>Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                 <Form.Group className="mb-3" controlId="editPetAge">
                  <Form.Label>Age (Years)*</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editPetSpecies">
                  <Form.Label>Species*</Form.Label>
                  <Form.Control
                    type="text"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="editPetBreed">
                  <Form.Label>Breed*</Form.Label>
                  <Form.Control
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
               <Col md={4}>
                 <Form.Group className="mb-3" controlId="editPetGender">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3" controlId="editPetWeight">
                  <Form.Label>Weight</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                  />
                </Form.Group>
               </Col>
               <Col md={4}>
                 <Form.Group className="mb-3" controlId="editPetWeightUnit">
                  <Form.Label>Weight Unit</Form.Label>
                  <Form.Select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </Form.Select>
                </Form.Group>
               </Col>
            </Row>

            <Form.Group className="mb-3" controlId="editPetProfileImage">
              <Form.Label>Profile Image URL</Form.Label>
              <Form.Control
                type="text"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {/* TODO: Implement actual image upload later */}
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="editPetMicrochipId">
              <Form.Label>Microchip ID</Form.Label>
              <Form.Control
                type="text"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleChange}
              />
            </Form.Group>

             <Form.Group className="mb-3" controlId="editPetLastCheckup">
              <Form.Label>Last Checkup Date</Form.Label>
              <Form.Control
                type="date"
                name="lastCheckup"
                value={formData.lastCheckup}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editPetMedicalHistory">
              <Form.Label>Medical History</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Enter known conditions, allergies, past treatments, etc."
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
                <Button variant="secondary" onClick={onHide} className="me-2">
                    Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Save Changes'}
                </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default PetEditModal; 