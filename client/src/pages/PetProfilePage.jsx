import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button, Image, ListGroup, Badge } from 'react-bootstrap';
import { PencilSquare, ArrowLeft } from 'react-bootstrap-icons';
import { fetchPetById } from '../services/api';
import theme from '../utils/theme';
import PetEditModal from '../components/PetEditModal'; // Import the modal

function PetProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const loadPet = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchPetById(petId);
        if (response.success) {
          setPet(response.pet);
        } else {
          setError(response.error || 'Pet not found.');
        }
      } catch (err) {
        console.error(`Error loading pet ${petId}:`, err);
        if (err.response?.status === 404) {
            setError('Pet not found.');
        } else if (err.response?.status === 403) {
            setError('You are not authorized to view this pet.');
            // Consider redirecting or showing a restricted message
        } else {
            setError(err.message || 'An error occurred while fetching pet details.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      loadPet();
    }
  }, [petId]);

  // Handler for showing edit modal
  const handleShowEditModal = () => setShowEditModal(true);
  const handleHideEditModal = () => setShowEditModal(false);
  
  // Handler for when modal successfully updates pet
  const handlePetUpdate = (updatedPetData) => {
      setPet(updatedPetData); // Update the state on this page
      // Optionally, show a success message
  };

  const styles = {
    pageHeader: {
      marginBottom: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      color: theme.colors.primary.main,
      textDecoration: 'none',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
    },
    profileCard: {
      borderRadius: theme.borderRadius.lg,
      border: 'none',
      boxShadow: theme.shadows.md,
      overflow: 'hidden',
    },
    profileImage: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      objectFit: 'cover',
      border: `4px solid ${theme.colors.background.light}`,
      boxShadow: theme.shadows.sm,
      margin: '0 auto 20px auto',
      display: 'block',
    },
    petName: {
      color: theme.colors.primary.dark,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: '5px',
    },
    petBreed: {
      color: theme.colors.text.secondary,
      textAlign: 'center',
      marginBottom: '20px',
    },
    sectionTitle: {
      color: theme.colors.primary.main,
      fontWeight: '600',
      marginTop: '20px',
      marginBottom: '15px',
      borderBottom: `1px solid ${theme.colors.background.medium}`,
      paddingBottom: '5px',
    },
    listGroupItem: {
      border: 'none',
      padding: '10px 0',
    },
    label: {
        fontWeight: '500',
        color: theme.colors.text.primary,
        marginRight: '10px',
    }
  };

  if (loading) {
    return <Container className="text-center py-5"><Spinner animation="border" style={{color: theme.colors.primary.main}} /></Container>;
  }

  if (error) {
    return (
        <Container className="py-5">
            <Alert variant="danger">{error}</Alert>
            <Button variant="secondary" onClick={() => navigate('/my-pets')}>Back to My Pets</Button>
        </Container>
    );
  }

  if (!pet) {
    return (
        <Container className="py-5">
            <Alert variant="warning">Pet data could not be loaded.</Alert>
             <Button variant="secondary" onClick={() => navigate('/my-pets')}>Back to My Pets</Button>
        </Container>
    );
  }

  return (
    <Container className="py-5">
      <div style={styles.pageHeader}>
        <Link to="/my-pets" style={styles.backButton}>
          <ArrowLeft size={20} className="me-2" /> Back to My Pets
        </Link>
        <Button variant="outline-primary" onClick={handleShowEditModal}> 
          <PencilSquare className="me-2" /> Edit Pet
        </Button>
      </div>

      <Card style={styles.profileCard}>
        <Card.Body className="p-4">
          <Image 
            src={pet.profileImage || 'https://via.placeholder.com/150?text=Pet+Photo'} 
            style={styles.profileImage} 
          />
          <h2 style={styles.petName}>{pet.name}</h2>
          <p style={styles.petBreed}>{pet.breed} ({pet.species})</p>

          <Row>
            <Col md={6}>
              <h5 style={styles.sectionTitle}>Basic Information</h5>
              <ListGroup variant="flush">
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Age:</span> {pet.age} years old</ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Gender:</span> {pet.gender || 'N/A'}</ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Weight:</span> {pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'N/A'}</ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Microchip ID:</span> {pet.microchipId || 'N/A'}</ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <h5 style={styles.sectionTitle}>Health & History</h5>
              <ListGroup variant="flush">
                 <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Last Checkup:</span> {pet.lastCheckup ? new Date(pet.lastCheckup).toLocaleDateString() : 'No record'}</ListGroup.Item>
                 <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Medical History:</span> {pet.medicalHistory || 'No significant history recorded.'}</ListGroup.Item>
                 {/* Add more fields like Vaccinations, Allergies here */}
              </ListGroup>
            </Col>
          </Row>

          {/* TODO: Section for related appointments or reminders? */}

        </Card.Body>
      </Card>

      {/* Render Edit Modal */}
      {pet && (
          <PetEditModal 
              show={showEditModal} 
              onHide={handleHideEditModal} 
              pet={pet} 
              onUpdate={handlePetUpdate}
          />
      )}
    </Container>
  );
}

export default PetProfilePage; 