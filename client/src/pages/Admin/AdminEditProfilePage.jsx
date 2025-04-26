import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getProfileById, adminCreateUpdateProfile } from '../../services/api'; // Use admin endpoint
import { ArrowLeft } from 'react-bootstrap-icons';

// Basic form validation helper
const validateProfileForm = (form) => {
    if (!form.bio || form.bio.length > 1000) return false;
    if (!form.licenseInfo) return false;
    if (!form.insuranceInfo) return false;
    // Add more specific validation as needed (e.g., URL formats, number ranges)
    return true;
};

function AdminEditProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [targetUserEmail, setTargetUserEmail] = useState(''); // Store email for display

  // Profile form state - adjusted field names to match model directly
  const [profileForm, setProfileForm] = useState({
    bio: '',
    credentials: [], // Array
    yearsExperience: '',
    photoUrl: '',
    serviceAreaDescription: '',
    serviceAreaRadiusKm: '',
    serviceAreaZipCodes: [], // Array
    licenseInfo: '',
    insuranceInfo: '',
    clinicAffiliations: [], // Array
    useExternalScheduling: false,
    externalSchedulingUrl: '',
    contactPhone: '',
    contactEmail: '',
    businessName: '',
    businessAddress: '',
    businessDescription: '',
    animalTypes: [], // Array
    specialtyServices: [] // Array
  });

  // Fetch profile data using getProfileById (public endpoint is fine for fetching)
  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccess(''); // Clear success message on fetch
    try {
      const response = await getProfileById(userId); // Fetch profile using userId
      if (response && response.success && response.profile) {
        const profile = response.profile;
        setTargetUserEmail(profile.user.email); // Store email

        // Populate the form, handling potential undefined fields and array conversions
        setProfileForm({
          bio: profile.bio || '',
          credentials: profile.credentials || [],
          yearsExperience: profile.yearsExperience || '',
          photoUrl: profile.photoUrl || '',
          serviceAreaDescription: profile.serviceAreaDescription || '',
          serviceAreaRadiusKm: profile.serviceAreaRadiusKm || '',
          serviceAreaZipCodes: profile.serviceAreaZipCodes || [],
          licenseInfo: profile.licenseInfo || '',
          insuranceInfo: profile.insuranceInfo || '',
          clinicAffiliations: profile.clinicAffiliations || [],
          useExternalScheduling: profile.useExternalScheduling || false,
          externalSchedulingUrl: profile.externalSchedulingUrl || '',
          contactPhone: profile.contactPhone || '',
          contactEmail: profile.contactEmail || '',
          businessName: profile.businessName || '',
          businessAddress: profile.businessAddress || '',
          businessDescription: profile.businessDescription || '',
          animalTypes: profile.animalTypes || [],
          specialtyServices: profile.specialtyServices || [],
        });
      } else {
        // Handle case where profile doesn't exist yet for this provider user
        // Fetch user email separately if needed for display, or handle gracefully
        console.log('Profile not found, initializing empty form for user:', userId);
         setError('Provider profile not found. You can create one here.');
         // Optionally fetch user details to display email even without profile
      }
    } catch (err) {
      console.error('Fetch Profile Error:', err);
      setError('Failed to load profile data. ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Generic handler for most input types (text, number, textarea, url, email, phone)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Specific handler for inputs that should be stored as arrays (comma-separated input)
  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    // Split by comma, trim whitespace, filter empty strings
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setProfileForm({
      ...profileForm,
      [name]: arrayValue,
    });
  };

    // Specific handler for multi-select (like animalTypes)
    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setProfileForm({ ...profileForm, [name]: value });
    };


  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfileForm(profileForm)) {
        setError('Please fill in all required fields correctly.');
        return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    // Prepare data for API (ensure numbers are numbers)
    const payload = {
        ...profileForm,
        yearsExperience: Number(profileForm.yearsExperience) || 0,
        serviceAreaRadiusKm: Number(profileForm.serviceAreaRadiusKm) || 0,
    };

    try {
      // Use the new admin endpoint
      const response = await adminCreateUpdateProfile(userId, payload);
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
        // Optionally refetch or update local state if needed
        fetchProfile(); // Refresh data after save
      } else {
          setError(response.error || 'Failed to update profile.')
      }
    } catch (err) {
      console.error('Save Profile Error:', err);
      setError('Failed to update profile. ' + (err.message || ''));
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => navigate(-1); // Function to go back

  if (isLoading) {
    return <Container className="text-center mt-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="mt-4 mb-5">
       <Button variant="link" onClick={goBack} className="mb-3 ps-0">
        <ArrowLeft className="me-2" /> Back to User List
      </Button>
      <h2>Edit Profile for {targetUserEmail || `User ID: ${userId}`}</h2>
      <p>Manage the Visiting Vet Profile details for this provider.</p>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Card>
        <Card.Body>
           <Form onSubmit={handleProfileSubmit}>

            {/* Basic Info */}
            <Row>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="businessName">
                        <Form.Label>Business Name</Form.Label>
                        <Form.Control type="text" name="businessName" value={profileForm.businessName} onChange={handleInputChange} />
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="contactPhone">
                        <Form.Label>Contact Phone</Form.Label>
                        <Form.Control type="tel" name="contactPhone" value={profileForm.contactPhone} onChange={handleInputChange} />
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="contactEmail">
                        <Form.Label>Contact Email</Form.Label>
                        <Form.Control type="email" name="contactEmail" value={profileForm.contactEmail} onChange={handleInputChange} />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="photoUrl">
                        <Form.Label>Photo/Logo URL</Form.Label>
                        <Form.Control type="url" name="photoUrl" value={profileForm.photoUrl} onChange={handleInputChange} placeholder="https://..."/>
                    </Form.Group>
                </Col>
            </Row>

             {/* Professional Details */}
             <Row>
                 <Col md={12}>
                    <Form.Group className="mb-3" controlId="bio">
                        <Form.Label>Professional Bio *</Form.Label>
                        <Form.Control as="textarea" rows={4} name="bio" value={profileForm.bio} onChange={handleInputChange} required maxLength={1000} />
                    </Form.Group>
                 </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="credentials">
                        <Form.Label>Credentials</Form.Label>
                        <Form.Control type="text" name="credentials" value={profileForm.credentials.join(', ')} onChange={handleArrayInputChange} placeholder="DVM, VMD (comma-separated)"/>
                        <Form.Text muted>Enter credentials separated by commas.</Form.Text>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="yearsExperience">
                        <Form.Label>Years of Experience</Form.Label>
                        <Form.Control type="number" name="yearsExperience" value={profileForm.yearsExperience} onChange={handleInputChange} min="0"/>
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="licenseInfo">
                        <Form.Label>License Information *</Form.Label>
                        <Form.Control type="text" name="licenseInfo" value={profileForm.licenseInfo} onChange={handleInputChange} required />
                    </Form.Group>
                </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="insuranceInfo">
                        <Form.Label>Insurance Information *</Form.Label>
                        <Form.Control type="text" name="insuranceInfo" value={profileForm.insuranceInfo} onChange={handleInputChange} required />
                    </Form.Group>
                </Col>
             </Row>

             {/* Business & Service Area */}
             <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3" controlId="businessDescription">
                        <Form.Label>Business Description</Form.Label>
                        <Form.Control as="textarea" rows={3} name="businessDescription" value={profileForm.businessDescription} onChange={handleInputChange} maxLength={1000} />
                    </Form.Group>
                 </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="businessAddress">
                        <Form.Label>Business Address</Form.Label>
                        <Form.Control type="text" name="businessAddress" value={profileForm.businessAddress} onChange={handleInputChange} />
                    </Form.Group>
                 </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="serviceAreaDescription">
                        <Form.Label>Service Area Description</Form.Label>
                        <Form.Control type="text" name="serviceAreaDescription" value={profileForm.serviceAreaDescription} onChange={handleInputChange} maxLength={500}/>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="serviceAreaRadiusKm">
                        <Form.Label>Service Area Radius (km)</Form.Label>
                        <Form.Control type="number" name="serviceAreaRadiusKm" value={profileForm.serviceAreaRadiusKm} onChange={handleInputChange} min="0"/>
                    </Form.Group>
                </Col>
                <Col md={6}>
                     <Form.Group className="mb-3" controlId="serviceAreaZipCodes">
                        <Form.Label>Service Area ZIP Codes</Form.Label>
                        <Form.Control type="text" name="serviceAreaZipCodes" value={profileForm.serviceAreaZipCodes.join(', ')} onChange={handleArrayInputChange} placeholder="e.g., 90210, 10001"/>
                         <Form.Text muted>Enter ZIP codes separated by commas.</Form.Text>
                    </Form.Group>
                </Col>
             </Row>

             {/* Specializations & Affiliations */}
             <Row>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="animalTypes">
                        <Form.Label>Animal Types Served</Form.Label>
                         <Form.Select
                            multiple
                            name="animalTypes"
                            value={profileForm.animalTypes}
                            onChange={handleMultiSelectChange}
                            style={{ height: '150px' }} // Make it easier to select multiple
                         >
                           {/* Ensure these match the enum in your Mongoose model */}
                           <option value="Small Animal">Small Animal (Dogs, Cats)</option>
                           <option value="Large Animal">Large Animal</option>
                           <option value="Equine">Equine</option>
                           <option value="Farm Animal">Farm Animal</option>
                           <option value="Avian">Avian</option>
                           <option value="Exotic">Exotic</option>
                           <option value="Other">Other</option>
                         </Form.Select>
                          <Form.Text muted>Hold Ctrl/Cmd to select multiple.</Form.Text>
                    </Form.Group>
                 </Col>
                 <Col md={6}>
                    <Form.Group className="mb-3" controlId="specialtyServices">
                        <Form.Label>Specialty Services Offered</Form.Label>
                         <Form.Control as="textarea" rows={4} name="specialtyServices" value={profileForm.specialtyServices.join('\n')} onChange={(e) => setProfileForm({...profileForm, specialtyServices: e.target.value.split('\n').map(s=>s.trim()).filter(Boolean)})} placeholder="List each specialty on a new line"/>
                         <Form.Text muted>Enter each specialty service on a new line.</Form.Text>
                    </Form.Group>
                 </Col>
                 <Col md={12}>
                    <Form.Group className="mb-3" controlId="clinicAffiliations">
                        <Form.Label>Clinic Affiliations</Form.Label>
                         <Form.Control type="text" name="clinicAffiliations" value={profileForm.clinicAffiliations.join(', ')} onChange={handleArrayInputChange} placeholder="Clinic names (comma-separated)"/>
                         <Form.Text muted>Enter affiliated clinic names separated by commas.</Form.Text>
                    </Form.Group>
                 </Col>
             </Row>

            {/* External Scheduling */}
            <Row>
                <Col md={6}>
                     <Form.Group className="mb-3" controlId="useExternalScheduling">
                         <Form.Check
                            type="switch"
                            label="Use External Scheduling Link?"
                            name="useExternalScheduling"
                            checked={profileForm.useExternalScheduling}
                            onChange={handleInputChange}
                         />
                    </Form.Group>
                </Col>
                <Col md={6}>
                     <Form.Group className="mb-3" controlId="externalSchedulingUrl">
                        <Form.Label>External Scheduling URL</Form.Label>
                        <Form.Control
                            type="url"
                            name="externalSchedulingUrl"
                            value={profileForm.externalSchedulingUrl}
                            onChange={handleInputChange}
                            placeholder="https://..."
                            disabled={!profileForm.useExternalScheduling}
                            required={profileForm.useExternalScheduling} // Only required if the switch is on
                        />
                         <Form.Text muted>Required if external scheduling is enabled.</Form.Text>
                    </Form.Group>
                </Col>
            </Row>


            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Saving...</> : 'Save Profile'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminEditProfilePage; 