import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner, Alert, Button, Image, ListGroup, Badge } from 'react-bootstrap';
import { PencilSquare, ArrowLeft } from 'react-bootstrap-icons';
import { fetchPetById } from '../services/api';
import api from '../services/api';
import theme from '../utils/theme';
import PetEditModal from '../components/PetEditModal';
import MedicalRecordList from '../components/Pets/MedicalRecordList';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

function PetProfilePage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleShowEditModal = () => setShowEditModal(true);
  const handleHideEditModal = () => setLoading(false);
  
  const handlePetUpdate = async () => {
      setShowEditModal(false);
      setLoading(true);
      try {
        const response = await fetchPetById(petId);
        if (response.success) {
          setPet(response.pet);
        } else {
          setError(response.error || 'Failed to reload pet data after update.');
        }
      } catch (err) {
           setError(err.message || 'An error occurred while reloading pet data.');
      } finally {
           setLoading(false);
      }
  };

  const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'PPP');
        } catch {
            return 'Invalid Date';
        }
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
      marginBottom: '30px',
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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    label: {
        fontWeight: '500',
        color: theme.colors.text.primary,
        marginRight: '10px',
    },
    value: {
        color: theme.colors.text.secondary,
    }
  };

  if (loading && !showEditModal) {
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
        {currentUser?._id === pet.owner && (
             <Button variant="outline-primary" onClick={handleShowEditModal}> 
                <PencilSquare className="me-2" /> Edit Pet
            </Button>
        )}
      </div>

      <Card style={styles.profileCard}>
        <Card.Body className="p-4">
          <Image 
            src={pet.profileImage || 'https://via.placeholder.com/150?text=Pet+Photo'} 
            style={styles.profileImage} 
          />
          <h2 style={styles.petName}>{pet.name}</h2>
          <p style={styles.petBreed}>{pet.breed || 'N/A'} ({pet.species})</p>

          <Row>
            <Col md={6}>
              <h5 style={styles.sectionTitle}>Basic Information</h5>
              <ListGroup variant="flush">
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Age:</span> <span style={styles.value}>{pet.calculatedAge || 'N/A'}</span></ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Date of Birth:</span> <span style={styles.value}>{formatDate(pet.dateOfBirth)}</span></ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Sex:</span> <span style={styles.value}>{pet.sex || 'N/A'}</span></ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Weight:</span> <span style={styles.value}>{pet.weight ? `${pet.weight} ${pet.weightUnit}` : 'N/A'}</span></ListGroup.Item>
                <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Microchip ID:</span> <span style={styles.value}>{pet.microchipId || 'N/A'}</span></ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              <h5 style={styles.sectionTitle}>Known Health Info</h5>
              <ListGroup variant="flush">
                 <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Allergies:</span> 
                    <span style={styles.value}>{pet.allergies?.length > 0 ? pet.allergies.join(', ') : 'None recorded'}</span>
                 </ListGroup.Item>
                 <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Existing Conditions:</span> 
                    <span style={styles.value}>{pet.existingConditions?.length > 0 ? pet.existingConditions.join(', ') : 'None recorded'}</span>
                 </ListGroup.Item>
                  <ListGroup.Item style={styles.listGroupItem}><span style={styles.label}>Last Checkup:</span> <span style={styles.value}>{formatDate(pet.lastCheckup)}</span></ListGroup.Item>
              </ListGroup>
            </Col>
          </Row>

        </Card.Body>
      </Card>

      <MedicalRecordList 
        petId={petId} 
        petOwnerId={pet.owner}
        currentUser={currentUser}
      />

      {pet && showEditModal && (
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