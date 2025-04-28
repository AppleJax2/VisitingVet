import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { updatePet } from '../services/api';

function PetEditModal({ show, onHide, pet, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

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
        microchipId: pet.microchipId || '',
        medicalHistory: pet.medicalHistory || '',
        lastCheckup: pet.lastCheckup ? new Date(pet.lastCheckup).toISOString().split('T')[0] : '',
      });
    } else {
      // Reset form if no pet is provided (though this shouldn't happen in edit mode)
      setFormData({});
    }
    // Clear errors when modal opens or pet changes
    setError('');
    setValidationErrors({});
  }, [pet, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Required fields
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.species || formData.species.trim() === '') {
      errors.species = 'Species is required';
      isValid = false;
    }
    
    if (!formData.breed || formData.breed.trim() === '') {
      errors.breed = 'Breed is required';
      isValid = false;
    }
    
    if (formData.age === '') {
      errors.age = 'Age is required';
      isValid = false;
    } else if (isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      errors.age = 'Age must be a non-negative number';
      isValid = false;
    }
    
    // Optional fields with validation
    if (formData.weight !== '' && (isNaN(Number(formData.weight)) || Number(formData.weight) < 0)) {
      errors.weight = 'Weight must be a non-negative number';
      isValid = false;
    }
    
    setValidationErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const payload = { ...formData };
      // Ensure age is a number
      payload.age = Number(payload.age);
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
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg" 
      centered
      contentClassName="border-0 shadow-lg"
    >
      <Modal.Header closeButton className="border-bottom pb-3">
        <Modal.Title className="fw-bold">Edit Pet: {pet?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-4">
        {error && (
          <Alert 
            variant="danger" 
            className="mb-4 d-flex align-items-center"
          >
            {error}
          </Alert>
        )}
        
        {!isLoading && pet && (
          <Form onSubmit={handleSubmit} noValidate>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="editPetName">
                  <Form.Label className="fw-semibold">Name*</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.name}
                    className="form-control shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editPetAge">
                  <Form.Label className="fw-semibold">Age (Years)*</Form.Label>
                  <Form.Control
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    isInvalid={!!validationErrors.age}
                    className="form-control shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.age}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="editPetSpecies">
                  <Form.Label className="fw-semibold">Species*</Form.Label>
                  <Form.Control
                    type="text"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.species}
                    className="form-control shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.species}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="editPetBreed">
                  <Form.Label className="fw-semibold">Breed*</Form.Label>
                  <Form.Control
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    isInvalid={!!validationErrors.breed}
                    className="form-control shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.breed}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="editPetGender">
                  <Form.Label className="fw-semibold">Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="form-select shadow-sm"
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="editPetWeight">
                  <Form.Label className="fw-semibold">Weight</Form.Label>
                  <Form.Control
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    min="0"
                    step="0.1"
                    isInvalid={!!validationErrors.weight}
                    className="form-control shadow-sm"
                  />
                  <Form.Control.Feedback type="invalid">
                    {validationErrors.weight}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="editPetWeightUnit">
                  <Form.Label className="fw-semibold">Weight Unit</Form.Label>
                  <Form.Select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                    className="form-select shadow-sm"
                  >
                    <option value="lbs">lbs</option>
                    <option value="kg">kg</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="editPetMicrochipId">
              <Form.Label className="fw-semibold">Microchip ID</Form.Label>
              <Form.Control
                type="text"
                name="microchipId"
                value={formData.microchipId}
                onChange={handleChange}
                className="form-control shadow-sm"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="editPetLastCheckup">
              <Form.Label className="fw-semibold">Last Checkup Date</Form.Label>
              <Form.Control
                type="date"
                name="lastCheckup"
                value={formData.lastCheckup}
                onChange={handleChange}
                className="form-control shadow-sm"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="editPetMedicalHistory">
              <Form.Label className="fw-semibold">Medical History</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Enter known conditions, allergies, past treatments, etc."
                className="form-control shadow-sm"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="outline-secondary" 
                onClick={onHide}
                className="px-4 fw-medium"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                className="px-4 fw-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default PetEditModal; 