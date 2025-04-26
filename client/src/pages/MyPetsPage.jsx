import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { PlusCircle, PencilSquare, Trash, Eye } from 'react-bootstrap-icons';
import { fetchUserPets, deletePet } from '../services/api'; // Assuming deletePet exists
import theme from '../utils/theme';
import PetEditModal from '../components/PetEditModal'; // Import the modal
// import PetDetailModal from '../components/PetDetailModal'; // Future component for viewing details

function MyPetsPage() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const navigate = useNavigate();

  // State for Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  // TODO: State for Detail Modal
  // const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const loadPets = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchUserPets();
        if (response.success) {
          setPets(response.pets || []);
        } else {
          setError(response.error || 'Failed to load pets.');
        }
      } catch (err) {
        console.error('Error loading pets:', err);
        setError(err.message || 'An error occurred while fetching pets.');
        // Handle potential 401 Unauthorized errors - redirect to login?
      } finally {
        setLoading(false);
      }
    };
    loadPets();
  }, []);

  const handleDelete = async (petId, petName) => {
    if (!window.confirm(`Are you sure you want to delete ${petName}? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteError('');
    setDeleteSuccess('');
    try {
      const response = await deletePet(petId);
      if (response.success) {
        setPets(pets.filter(pet => pet._id !== petId));
        setDeleteSuccess(`Successfully deleted ${petName}.`);
      } else {
        setDeleteError(response.error || 'Failed to delete pet.');
      }
    } catch (err) {
      console.error('Error deleting pet:', err);
      setDeleteError(err.message || 'An error occurred during deletion.');
    }
  };

  // Handlers for showing modals
  const handleShowEditModal = (pet) => {
    setSelectedPet(pet);
    setShowEditModal(true);
  };

  const handleHideEditModal = () => {
    setShowEditModal(false);
    setSelectedPet(null);
  };

  const handlePetUpdate = (updatedPet) => {
    setPets(pets.map(p => p._id === updatedPet._id ? updatedPet : p));
    // Optionally show a success message here
  };

  // TODO: Handlers for Detail Modal
  // const handleViewDetails = (pet) => {
  //   setSelectedPet(pet);
  //   setShowDetailModal(true);
  // };

  const styles = {
    pageTitle: {
      color: theme.colors.primary.dark,
      marginBottom: '30px',
    },
    petCard: {
      border: 'none',
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.sm,
      overflow: 'hidden',
      marginBottom: '20px',
      height: '100%',
    },
    petImage: {
      height: '180px',
      objectFit: 'cover',
    },
    cardTitle: {
      color: theme.colors.primary.main,
      fontWeight: '600',
    },
    addButtonCard: {
      border: `2px dashed ${theme.colors.background.medium}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
      backgroundColor: theme.colors.background.light,
      '&:hover': {
        backgroundColor: theme.colors.background.medium,
      },
      height: '100%',
    },
    addButtonIcon: {
      color: theme.colors.primary.main,
      fontSize: '2.5rem',
      marginBottom: '10px',
    },
    actionButton: {
      marginRight: '5px',
      marginLeft: '5px',
    }
  };

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 style={styles.pageTitle}>My Pets</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => navigate('/add-pet')} style={{backgroundColor: theme.colors.primary.main}}>
            <PlusCircle className="me-2" /> Add New Pet
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}
      {deleteError && <Alert variant="danger" dismissible onClose={() => setDeleteError('')}>{deleteError}</Alert>}
      {deleteSuccess && <Alert variant="success" dismissible onClose={() => setDeleteSuccess('')}>{deleteSuccess}</Alert>}

      {loading ? (
        <div className="text-center"><Spinner animation="border" style={{color: theme.colors.primary.main}} /></div>
      ) : (
        <Row>
          {pets.map((pet) => (
            <Col md={6} lg={4} key={pet._id} className="mb-4">
              <Card style={styles.petCard}>
                <Card.Img 
                  variant="top" 
                  src={pet.profileImage || 'https://via.placeholder.com/300x200?text=Pet+Photo'} 
                  style={styles.petImage}
                />
                <Card.Body>
                  <Card.Title style={styles.cardTitle}>{pet.name}</Card.Title>
                  <Card.Text className="text-muted">
                    {pet.breed} ({pet.species}) • {pet.age} years old
                  </Card.Text>
                  {/* Add more brief details if needed */}
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  {/* TODO: Implement View/Edit Modals later */}
                  {/* <Button variant="outline-secondary" size="sm" style={styles.actionButton} onClick={() => handleViewDetails(pet)} title="View Details"><Eye /></Button> */}
                  <Button variant="outline-primary" size="sm" style={styles.actionButton} onClick={() => handleShowEditModal(pet)} title="Edit Pet"><PencilSquare /></Button>
                  <Button variant="outline-danger" size="sm" style={styles.actionButton} onClick={() => handleDelete(pet._id, pet.name)} title="Delete Pet"><Trash /></Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
          
          {/* Add Pet Card (Always visible or if pets array is empty?) - Let's keep it simple for now */}
          {/* Alternative Add Pet Card if list is empty
          {pets.length === 0 && (
             <Col md={6} lg={4} className="mb-4">
               <Card 
                 style={styles.addButtonCard}
                 onClick={() => navigate('/add-pet')}
               >
                 <Card.Body>
                   <PlusCircle style={styles.addButtonIcon} />
                   <p className="text-muted mb-0">Add your first pet!</p>
                 </Card.Body>
               </Card>
             </Col>
          )} 
          */}
        </Row>
      )}

      {/* Render Edit Modal */}
      {selectedPet && (
        <PetEditModal 
          show={showEditModal} 
          onHide={handleHideEditModal} 
          pet={selectedPet} 
          onUpdate={handlePetUpdate}
        />
      )}

      {/* TODO: Render Detail Modal */}
      {/* {selectedPet && showDetailModal && (
        <PetDetailModal 
          show={showDetailModal} 
          onHide={() => setShowDetailModal(false)} 
          pet={selectedPet} 
        />
      )} */}
    </Container>
  );
}

export default MyPetsPage; 