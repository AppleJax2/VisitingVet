import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import Select from 'react-select'; // Using react-select for better multi-select UX
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const TIME_SLOTS = [
  { value: '8:00 AM', label: '8:00 AM' }, { value: '9:00 AM', label: '9:00 AM' }, 
  { value: '10:00 AM', label: '10:00 AM' }, { value: '11:00 AM', label: '11:00 AM' }, 
  { value: '12:00 PM', label: '12:00 PM' }, { value: '1:00 PM', label: '1:00 PM' }, 
  { value: '2:00 PM', label: '2:00 PM' }, { value: '3:00 PM', label: '3:00 PM' }, 
  { value: '4:00 PM', label: '4:00 PM' }, { value: '5:00 PM', label: '5:00 PM' }, 
  { value: '6:00 PM', label: '6:00 PM' }
];

const URGENCY_LEVELS = [
  { value: 'low', label: 'Low - Routine care, can wait weeks' },
  { value: 'medium', label: 'Medium - Should be seen within a week' },
  { value: 'high', label: 'High - Should be seen within days' },
  { value: 'emergency', label: 'Emergency - Requires immediate attention' }
];

const ServiceRequestForm = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    petOwnerId: '',
    petId: '',
    providerId: '',
    medicalNotes: '',
    urgency: 'medium',
    requestedServices: [], // Array of { service: id, notes: '', label: name-price }
    preferredDates: [{ date: '', timeSlot: '' }] // Array of { date: string, timeSlot: string }
  });
  
  // Options state
  const [petOwnerOptions, setPetOwnerOptions] = useState([]);
  const [petOptions, setPetOptions] = useState([]);
  const [providerOptions, setProviderOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch initial dropdown data (pet owners, providers)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch pet owners
        const ownersRes = await axios.get('/api/admin/users', { params: { role: 'PetOwner' } });
        setPetOwnerOptions(
          ownersRes.data.data.map(owner => ({ value: owner._id, label: `${owner.name} (${owner.email})` }))
        );
        
        // Fetch verified providers
        const providersRes = await axios.get('/api/admin/users', { params: { role: 'MVSProvider', verified: true } });
        setProviderOptions(
          providersRes.data.data.map(prov => ({ value: prov._id, label: `${prov.name} (${prov.email})` }))
        );
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load required data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch pets when pet owner changes
  useEffect(() => {
    if (!formData.petOwnerId) {
      setPetOptions([]);
      setFormData(prev => ({ ...prev, petId: '' }));
      return;
    }
    
    const fetchPets = async () => {
      try {
        const res = await axios.get(`/api/pets/owner/${formData.petOwnerId}`);
        setPetOptions(
          res.data.data.map(pet => ({ value: pet._id, label: `${pet.name} (${pet.species}, ${pet.breed})` }))
        );
      } catch (err) {
        console.error('Error fetching pets:', err);
        setPetOptions([]);
      }
    };
    fetchPets();
  }, [formData.petOwnerId]);

  // Fetch services when provider changes
  useEffect(() => {
    if (!formData.providerId) {
      setServiceOptions([]);
      setFormData(prev => ({ ...prev, requestedServices: [] }));
      return;
    }
    
    const fetchServices = async () => {
      try {
        const res = await axios.get(`/api/profiles/visiting-vet/services`, { params: { providerId: formData.providerId } });
        setServiceOptions(
          res.data.data.map(service => ({ 
            value: service._id, 
            label: `${service.name} - $${service.price}`,
            service: service._id // Keep original ID
          }))
        );
      } catch (err) {
        console.error('Error fetching services:', err);
        setServiceOptions([]);
      }
    };
    fetchServices();
  }, [formData.providerId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSelectChange = (name, selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : '' }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    // Reset dependent fields if parent changes
    if (name === 'petOwnerId') {
      setFormData(prev => ({ ...prev, petId: '' }));
      setPetOptions([]);
    }
    if (name === 'providerId') {
      setFormData(prev => ({ ...prev, requestedServices: [] }));
      setServiceOptions([]);
    }
  };

  const handleMultiSelectChange = (name, selectedOptions) => {
    setFormData(prev => ({ ...prev, [name]: selectedOptions || [] }));
     if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (index, field, value) => {
    const updatedDates = [...formData.preferredDates];
    updatedDates[index][field] = value;
    setFormData(prev => ({ ...prev, preferredDates: updatedDates }));
    if (validationErrors.preferredDates) {
      setValidationErrors(prev => ({ ...prev, preferredDates: null }));
    }
  };

  const addPreferredDate = () => {
    setFormData(prev => ({ 
      ...prev, 
      preferredDates: [...prev.preferredDates, { date: '', timeSlot: '' }]
    }));
  };

  const removePreferredDate = (index) => {
    if (formData.preferredDates.length > 1) {
      const updatedDates = formData.preferredDates.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, preferredDates: updatedDates }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.petOwnerId) errors.petOwnerId = 'Pet owner is required.';
    if (!formData.petId) errors.petId = 'Pet is required.';
    if (!formData.providerId) errors.providerId = 'Provider is required.';
    if (!formData.medicalNotes.trim()) errors.medicalNotes = 'Medical notes are required.';
    if (formData.requestedServices.length === 0) errors.requestedServices = 'At least one service must be selected.';
    
    const validDates = formData.preferredDates.filter(d => d.date && d.timeSlot);
    if (validDates.length === 0) {
      errors.preferredDates = 'At least one preferred date and time must be provided.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const submissionData = {
        ...formData,
        requestedServices: formData.requestedServices.map(s => ({ 
          service: s.value, // Pass the service ID
          notes: '' // Notes per service not implemented in this form
        })),
        preferredDates: formData.preferredDates.filter(d => d.date && d.timeSlot)
      };
      
      const response = await axios.post('/api/service-requests', submissionData);
      
      if (onSuccess) {
        onSuccess(response.data.data);
      }
      // Optionally reset form here if needed
      // setFormData({ ...initial state... });
      
    } catch (err) {
      console.error('Error creating service request:', err);
      setError(err.response?.data?.message || 'Failed to create service request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading form data...</p>
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <Card.Title as="h5">Create New Service Request</Card.Title>
        <Card.Subtitle className="text-muted">Refer a pet owner to a specialist.</Card.Subtitle>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit} noValidate>
          <Row>
            {/* Pet Owner */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="petOwnerId">
                <Form.Label>Pet Owner *</Form.Label>
                <Select
                  options={petOwnerOptions}
                  onChange={(opt) => handleSelectChange('petOwnerId', opt)}
                  value={petOwnerOptions.find(opt => opt.value === formData.petOwnerId)}
                  placeholder="Select Pet Owner..."
                  isClearable
                  isInvalid={!!validationErrors.petOwnerId}
                />
                <Form.Control.Feedback type="invalid" style={{ display: validationErrors.petOwnerId ? 'block' : 'none' }}>
                  {validationErrors.petOwnerId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            {/* Pet */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="petId">
                <Form.Label>Pet *</Form.Label>
                <Select
                  options={petOptions}
                  onChange={(opt) => handleSelectChange('petId', opt)}
                  value={petOptions.find(opt => opt.value === formData.petId)}
                  placeholder="Select Pet..."
                  isDisabled={!formData.petOwnerId || petOptions.length === 0}
                  isClearable
                  isInvalid={!!validationErrors.petId}
                />
                 {formData.petOwnerId && petOptions.length === 0 && (
                  <Form.Text className="text-muted">No pets found for this owner.</Form.Text>
                )}
                <Form.Control.Feedback type="invalid" style={{ display: validationErrors.petId ? 'block' : 'none' }}>
                  {validationErrors.petId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            {/* Provider */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="providerId">
                <Form.Label>Specialist Provider *</Form.Label>
                <Select
                  options={providerOptions}
                  onChange={(opt) => handleSelectChange('providerId', opt)}
                  value={providerOptions.find(opt => opt.value === formData.providerId)}
                  placeholder="Select Specialist..."
                  isClearable
                  isInvalid={!!validationErrors.providerId}
                />
                <Form.Control.Feedback type="invalid" style={{ display: validationErrors.providerId ? 'block' : 'none' }}>
                  {validationErrors.providerId}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            {/* Urgency */}
            <Col md={6} className="mb-3">
              <Form.Group controlId="urgency">
                <Form.Label>Urgency</Form.Label>
                 <Select
                  options={URGENCY_LEVELS}
                  onChange={(opt) => handleSelectChange('urgency', opt)}
                  value={URGENCY_LEVELS.find(opt => opt.value === formData.urgency)}
                  defaultValue={URGENCY_LEVELS.find(opt => opt.value === 'medium')}
                />
              </Form.Group>
            </Col>
          </Row>
          
          {/* Requested Services */}
          <Form.Group controlId="requestedServices" className="mb-3">
            <Form.Label>Requested Services *</Form.Label>
            <Select
              isMulti
              options={serviceOptions}
              onChange={(opts) => handleMultiSelectChange('requestedServices', opts)}
              value={formData.requestedServices}
              placeholder="Select Services..."
              isDisabled={!formData.providerId || serviceOptions.length === 0}
              isInvalid={!!validationErrors.requestedServices}
            />
             {formData.providerId && serviceOptions.length === 0 && (
                <Form.Text className="text-muted">No services found for this provider.</Form.Text>
              )}
            <Form.Control.Feedback type="invalid" style={{ display: validationErrors.requestedServices ? 'block' : 'none' }}>
              {validationErrors.requestedServices}
            </Form.Control.Feedback>
          </Form.Group>
          
          {/* Medical Notes */}
          <Form.Group controlId="medicalNotes" className="mb-3">
            <Form.Label>Medical Notes *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="medicalNotes"
              value={formData.medicalNotes}
              onChange={handleInputChange}
              placeholder="Provide relevant medical history, reason for referral, etc."
              isInvalid={!!validationErrors.medicalNotes}
            />
            <Form.Control.Feedback type="invalid">
              {validationErrors.medicalNotes}
            </Form.Control.Feedback>
          </Form.Group>
          
          {/* Preferred Dates */}
          <Form.Group className="mb-3">
            <Form.Label>Preferred Dates & Times *</Form.Label>
             {formData.preferredDates.map((pd, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col md={5}>
                  <Form.Control
                    type="date"
                    value={pd.date}
                    onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                  />
                </Col>
                <Col md={5}>
                   <Select
                    options={TIME_SLOTS}
                    onChange={(opt) => handleDateChange(index, 'timeSlot', opt ? opt.value : '')}
                    value={TIME_SLOTS.find(ts => ts.value === pd.timeSlot)}
                    placeholder="Select Time..."
                    isClearable
                  />
                </Col>
                <Col md={2}>
                  {formData.preferredDates.length > 1 && (
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => removePreferredDate(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Col>
              </Row>
            ))}
            <Button variant="outline-secondary" size="sm" onClick={addPreferredDate} className="mt-1">
              Add Another Date
            </Button>
             {validationErrors.preferredDates && (
                <div className="text-danger mt-2" style={{ fontSize: '0.875em' }}>
                    {validationErrors.preferredDates}
                </div>
            )}
          </Form.Group>

          <hr />

          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onCancel} className="me-2" disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={submitting}>
              {submitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Create Request'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ServiceRequestForm; 