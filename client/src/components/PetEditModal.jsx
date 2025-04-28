import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import { updatePet, uploadPetImage } from '../services/api';
import { toast } from 'react-toastify';

function PetEditModal({ show, onHide, pet, onUpdate }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

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
      setPreviewUrl(pet.profileImage || null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      // Reset form if no pet is provided (though this shouldn't happen in edit mode)
      setFormData({});
      setPreviewUrl(null);
      setSelectedFile(null);
    }
    // Clear errors when modal opens or pet changes
    setError('');
    setValidationErrors({});
  }, [pet, show]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic type check (can be more robust)
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, GIF).');
        setSelectedFile(null);
        setPreviewUrl(formData.profileImage || null); // Revert to original image
        return;
      }
      // Size check (e.g., 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large (Max 5MB).');
        setSelectedFile(null);
        setPreviewUrl(formData.profileImage || null); // Revert to original image
        return;
      }
      
      setSelectedFile(file);
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      setError(''); // Clear errors on valid selection
    }
  };

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
    let imageUrl = formData.profileImage;

    try {
      // 1. Upload new image if selected
      if (selectedFile) {
        const uploadResponse = await uploadPetImage(pet._id, selectedFile);
        if (uploadResponse && uploadResponse.success && uploadResponse.data?.imageUrl) {
          imageUrl = uploadResponse.data.imageUrl;
          toast.info('Profile image uploaded.');
        } else {
          throw new Error(uploadResponse.error || 'Failed to upload image.');
        }
      }

      // 2. Update pet details with potentially new image URL
      const payload = { 
        ...formData, 
        profileImage: imageUrl,
        age: Number(formData.age),
        weight: formData.weight ? Number(formData.weight) : null,
        lastCheckup: formData.lastCheckup || null,
      };
      
      const result = await updatePet(pet._id, payload);
      if (result.success) {
        toast.success('Pet details updated successfully!');
        onUpdate(result.pet);
        onHide();
      } else {
        setError(result.error || 'Failed to update pet details.');
      }
    } catch (err) {
      console.error('Error updating pet profile:', err);
      setError(err.message || 'An error occurred while updating the pet.');
      toast.error(`Update failed: ${err.message}`);
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

            <Row className="mb-3 align-items-center">
              <Col md={3} className="text-center">
                <Image 
                  src={previewUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                  roundedCircle 
                  thumbnail 
                  width={100} 
                  height={100} 
                  style={{ objectFit: 'cover' }}
                  alt="Pet profile preview"
                />
              </Col>
              <Col md={9}>
                <Form.Group controlId="editPetProfileImageFile">
                  <Form.Label className="fw-semibold">Profile Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="petImage"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="form-control shadow-sm"
                  />
                  <Form.Text muted>
                    Upload a new image (JPG, PNG, GIF, max 5MB). Leave blank to keep current image.
                  </Form.Text>
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