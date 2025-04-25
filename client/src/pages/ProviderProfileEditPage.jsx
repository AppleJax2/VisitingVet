import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner, ListGroup, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMyProfile, createUpdateProfile, createService, updateService, deleteService, checkAuthStatus } from '../services/api';

function ProviderProfileEditPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    bio: '',
    credentials: '',
    yearsExperience: '',
    photoUrl: '',
    serviceAreaDescription: '',
    serviceAreaRadiusKm: '',
    serviceAreaZipCodes: '',
    licenseInfo: '',
    insuranceInfo: '',
    clinicAffiliations: '',
  });

  // Service form state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    estimatedDurationMinutes: '',
    price: '',
    priceType: 'Flat',
    offeredLocation: 'InHome',
  });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Check if user is authenticated and a visiting vet provider
  useEffect(() => {
    const verifyUser = async () => {
      try {
        const data = await checkAuthStatus();
        if (!data || !data.success) {
          navigate('/login');
          return;
        }
        
        if (data.user.role !== 'MVSProvider') {
          navigate('/dashboard');
          return;
        }
        
        // Try to fetch existing profile
        fetchProfile();
      } catch (err) {
        setError('Authentication failed. Please login again.');
        navigate('/login');
      }
    };

    verifyUser();
  }, [navigate]);

  // Fetch profile data
  const fetchProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getMyProfile();
      if (data && data.success && data.profile) {
        setProfile(data.profile);
        setServices(data.profile.services || []);
        
        // Populate the form with existing data
        setProfileForm({
          bio: data.profile.bio || '',
          credentials: (data.profile.credentials || []).join(', '),
          yearsExperience: data.profile.yearsExperience || '',
          photoUrl: data.profile.photoUrl || '',
          serviceAreaDescription: data.profile.serviceAreaDescription || '',
          serviceAreaRadiusKm: data.profile.serviceAreaRadiusKm || '',
          serviceAreaZipCodes: (data.profile.serviceAreaZipCodes || []).join(', '),
          licenseInfo: data.profile.licenseInfo || '',
          insuranceInfo: data.profile.insuranceInfo || '',
          clinicAffiliations: (data.profile.clinicAffiliations || []).join(', '),
        });
      }
    } catch (err) {
      // If profile doesn't exist yet, that's okay
      if (err.message !== 'Failed to get profile') {
        setError('Failed to load profile data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({ ...profileForm, [name]: value });
  };

  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Convert comma-separated strings to arrays
      const profileData = {
        ...profileForm,
        credentials: profileForm.credentials.split(',').map((item) => item.trim()).filter(Boolean),
        serviceAreaZipCodes: profileForm.serviceAreaZipCodes.split(',').map((item) => item.trim()).filter(Boolean),
        clinicAffiliations: profileForm.clinicAffiliations.split(',').map((item) => item.trim()).filter(Boolean),
        yearsExperience: Number(profileForm.yearsExperience),
        serviceAreaRadiusKm: Number(profileForm.serviceAreaRadiusKm),
      };

      const response = await createUpdateProfile(profileData);
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
        // Refresh profile data
        fetchProfile();
      }
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle service form changes
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm({ ...serviceForm, [name]: value });
  };

  // Open service modal - for new service or editing existing
  const openServiceModal = (service = null) => {
    if (service) {
      // Editing existing service
      setServiceForm({
        name: service.name,
        description: service.description,
        estimatedDurationMinutes: service.estimatedDurationMinutes,
        price: service.price,
        priceType: service.priceType,
        offeredLocation: service.offeredLocation,
      });
      setEditingServiceId(service._id);
    } else {
      // New service
      setServiceForm({
        name: '',
        description: '',
        estimatedDurationMinutes: '',
        price: '',
        priceType: 'Flat',
        offeredLocation: 'InHome',
      });
      setEditingServiceId(null);
    }
    setShowServiceModal(true);
  };

  // Handle service form submission
  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const serviceData = {
        ...serviceForm,
        estimatedDurationMinutes: Number(serviceForm.estimatedDurationMinutes),
        price: Number(serviceForm.price),
      };

      let response;
      if (editingServiceId) {
        // Update existing service
        response = await updateService(editingServiceId, serviceData);
      } else {
        // Create new service
        response = await createService(serviceData);
      }

      if (response && response.success) {
        setShowServiceModal(false);
        // Refresh profile to get updated services
        fetchProfile();
      }
    } catch (err) {
      setError(`Failed to ${editingServiceId ? 'update' : 'create'} service. Please try again.`);
    }
  };

  // Handle service deletion
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setError('');
    try {
      const response = await deleteService(serviceId);
      if (response && response.success) {
        // Refresh profile to get updated services
        fetchProfile();
      }
    } catch (err) {
      setError('Failed to delete service. Please try again.');
    }
  };

  if (isLoading && !profile) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <h2 className="mb-4">Manage Your Visiting Vet Profile</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Personal & Professional Information</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleProfileSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Professional Bio</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    required
                    placeholder="Describe your professional background and expertise..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Credentials</Form.Label>
                  <Form.Control
                    type="text"
                    name="credentials"
                    value={profileForm.credentials}
                    onChange={handleProfileChange}
                    placeholder="DVM, DACVS, etc. (comma separated)"
                  />
                  <Form.Text className="text-muted">
                    Enter your credentials separated by commas
                  </Form.Text>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Years of Experience</Form.Label>
                  <Form.Control
                    type="number"
                    name="yearsExperience"
                    value={profileForm.yearsExperience}
                    onChange={handleProfileChange}
                    min="0"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Profile Photo URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="photoUrl"
                    value={profileForm.photoUrl}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/your-photo.jpg"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>License Information</Form.Label>
                  <Form.Control
                    type="text"
                    name="licenseInfo"
                    value={profileForm.licenseInfo}
                    onChange={handleProfileChange}
                    required
                    placeholder="License number, state, etc."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Insurance Information</Form.Label>
                  <Form.Control
                    type="text"
                    name="insuranceInfo"
                    value={profileForm.insuranceInfo}
                    onChange={handleProfileChange}
                    required
                    placeholder="Insurance provider, policy number, etc."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Clinic Affiliations</Form.Label>
                  <Form.Control
                    type="text"
                    name="clinicAffiliations"
                    value={profileForm.clinicAffiliations}
                    onChange={handleProfileChange}
                    placeholder="Clinic names (comma separated)"
                  />
                  <Form.Text className="text-muted">
                    Enter clinic names separated by commas
                  </Form.Text>
                </Form.Group>
                
                <Button variant="primary" type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Service Area</h4>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Service Area Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="serviceAreaDescription"
                    value={profileForm.serviceAreaDescription}
                    onChange={handleProfileChange}
                    placeholder="Describe the areas you serve..."
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Service Radius (km)</Form.Label>
                  <Form.Control
                    type="number"
                    name="serviceAreaRadiusKm"
                    value={profileForm.serviceAreaRadiusKm}
                    onChange={handleProfileChange}
                    min="0"
                    placeholder="How far are you willing to travel?"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Service Area ZIP Codes</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceAreaZipCodes"
                    value={profileForm.serviceAreaZipCodes}
                    onChange={handleProfileChange}
                    placeholder="ZIP codes you serve (comma separated)"
                  />
                  <Form.Text className="text-muted">
                    Enter ZIP codes separated by commas
                  </Form.Text>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4>Services Offered</h4>
              <Button variant="success" size="sm" onClick={() => openServiceModal()}>
                Add New Service
              </Button>
            </Card.Header>
            <Card.Body>
              {services.length === 0 ? (
                <Alert variant="info">
                  You haven't added any services yet. Add your first service to get started.
                </Alert>
              ) : (
                <ListGroup>
                  {services.map((service) => (
                    <ListGroup.Item key={service._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5>{service.name}</h5>
                        <p className="mb-1">{service.description}</p>
                        <small>
                          {service.estimatedDurationMinutes} mins • ${service.price} ({service.priceType}) • 
                          {service.offeredLocation === 'InHome' ? 'In-Home' : 
                           service.offeredLocation === 'InClinic' ? 'In-Clinic' : 'Both'}
                        </small>
                      </div>
                      <div>
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => openServiceModal(service)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteService(service._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Service Modal */}
      <Modal show={showServiceModal} onHide={() => setShowServiceModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingServiceId ? 'Edit Service' : 'Add New Service'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleServiceSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Service Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={serviceForm.name}
                onChange={handleServiceChange}
                required
                placeholder="e.g., Wellness Exam, Vaccination, etc."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={serviceForm.description}
                onChange={handleServiceChange}
                required
                placeholder="Describe what this service includes..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Estimated Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                name="estimatedDurationMinutes"
                value={serviceForm.estimatedDurationMinutes}
                onChange={handleServiceChange}
                required
                min="1"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price ($)</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={serviceForm.price}
                onChange={handleServiceChange}
                required
                min="0"
                step="0.01"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Price Type</Form.Label>
              <Form.Select
                name="priceType"
                value={serviceForm.priceType}
                onChange={handleServiceChange}
              >
                <option value="Flat">Flat Fee</option>
                <option value="Hourly">Hourly Rate</option>
                <option value="Range">Price Range</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Service Location</Form.Label>
              <Form.Select
                name="offeredLocation"
                value={serviceForm.offeredLocation}
                onChange={handleServiceChange}
              >
                <option value="InHome">In-Home Only</option>
                <option value="InClinic">In-Clinic Only</option>
                <option value="Both">Both In-Home and In-Clinic</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowServiceModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingServiceId ? 'Update Service' : 'Add Service'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default ProviderProfileEditPage; 