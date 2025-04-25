import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { listProfiles } from '../services/api';

function ProviderSearchPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [profiles, setProfiles] = useState([]);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [searchZip, setSearchZip] = useState('');
  
  useEffect(() => {
    fetchProfiles();
  }, []);
  
  // Load all profiles
  const fetchProfiles = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listProfiles();
      if (data && data.success) {
        setProfiles(data.profiles);
        setFilteredProfiles(data.profiles);
      }
    } catch (err) {
      setError('Failed to load visiting veterinarians. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle zip code search
  const handleZipSearch = (e) => {
    e.preventDefault();
    if (!searchZip.trim()) {
      // If search is empty, show all profiles
      setFilteredProfiles(profiles);
      return;
    }
    
    // Filter profiles by zip code
    const filtered = profiles.filter(profile => 
      profile.serviceAreaZipCodes && 
      profile.serviceAreaZipCodes.some(zip => zip.includes(searchZip.trim()))
    );
    
    setFilteredProfiles(filtered);
  };
  
  // View a provider's profile
  const viewProviderProfile = (userId) => {
    navigate(`/providers/${userId}`);
  };
  
  if (isLoading) {
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
      <h1 className="mb-4">Find a Visiting Veterinarian</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Search by ZIP Code</h5>
          <Form onSubmit={handleZipSearch}>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="Enter ZIP code"
                value={searchZip}
                onChange={(e) => setSearchZip(e.target.value)}
              />
              <Button variant="primary" type="submit">
                Search
              </Button>
              {searchZip.trim() && (
                <Button 
                  variant="outline-secondary" 
                  onClick={() => {
                    setSearchZip('');
                    setFilteredProfiles(profiles);
                  }}
                >
                  Clear
                </Button>
              )}
            </InputGroup>
          </Form>
        </Card.Body>
      </Card>
      
      {filteredProfiles.length === 0 ? (
        <Alert variant="info">
          No visiting veterinarians found in your area. Please try a different ZIP code or contact us for assistance.
        </Alert>
      ) : (
        <Row>
          {filteredProfiles.map(profile => (
            <Col key={profile._id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <div className="text-center mb-3">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={`${profile.user.email}`}
                        className="rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                      >
                        {profile.user.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  <Card.Title className="text-center">{profile.user.email}</Card.Title>
                  
                  <Card.Text>
                    {profile.bio && profile.bio.length > 150
                      ? `${profile.bio.substring(0, 150)}...`
                      : profile.bio}
                  </Card.Text>
                  
                  {profile.credentials && profile.credentials.length > 0 && (
                    <p><strong>Credentials:</strong> {profile.credentials.join(', ')}</p>
                  )}
                  
                  {profile.yearsExperience && (
                    <p><strong>Experience:</strong> {profile.yearsExperience} years</p>
                  )}
                  
                  {profile.serviceAreaZipCodes && profile.serviceAreaZipCodes.length > 0 && (
                    <p>
                      <strong>Service ZIP Codes:</strong>{' '}
                      {profile.serviceAreaZipCodes.length > 3
                        ? `${profile.serviceAreaZipCodes.slice(0, 3).join(', ')}...`
                        : profile.serviceAreaZipCodes.join(', ')}
                    </p>
                  )}
                </Card.Body>
                <Card.Footer className="text-center bg-white border-top-0">
                  <Button
                    variant="primary"
                    onClick={() => viewProviderProfile(profile.user._id)}
                  >
                    View Profile
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default ProviderSearchPage; 